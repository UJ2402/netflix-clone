import db from "../firebaseApp";
import "./PlansScreen.css";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";

function PlansScreen() {
  const [products, setProducts] = useState([]);
  const user = useSelector(selectUser);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "customers", user.uid, "subscriptions"));

    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach(async (subscription) => {
        setSubscription({
          role: subscription.data().role,
          current_period_start:
            subscription.data().current_period_start.seconds,
          current_period_end: subscription.data().current_period_end.seconds,
        });
      });
    });
  }, [user.uid]);

  useEffect(() => {
    const q = query(collection(db, "products"), where("active", "==", true));

    onSnapshot(q, (querySnapshot) => {
      const products = {};

      querySnapshot.forEach(async (productDoc) => {
        products[productDoc.id] = productDoc.data();

        const productDocRef = doc(db, "products", productDoc.id);

        const priceSnap = await getDocs(collection(productDocRef, "prices"));

        priceSnap.forEach((price) => {
          products[productDoc.id].prices = {
            priceId: price.id,
            priceData: price.data(),
          };
        });
      });
      setProducts(products);
    });
  }, []);

  const loadCheckout = async (priceId) => {
    const docRef = await addDoc(
      collection(db, "customers", user.uid, "checkout_sessions"),
      {
        price: priceId,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      }
    );

    onSnapshot(docRef, async (snap) => {
      const { error, sessionId } = snap.data();

      if (error) {
        // Show an error to a customer and inspect your
        // Cloud functions logs in the firebase console.
        alert(`An error occurred: ${error.message}`);
      }
      if (sessionId) {
        // We have a session, let's redirect to Checkout
        // Init Stripe
        const stripe = await loadStripe(
          "pk_test_51NQ78zSEqAfxVJMISPZAV92LIX9IN71u1ArBSvJeAQGaRw8qxWvH0jLene3HEPH12KfRQS3sOBs9VfaCe9pghYQN00du2yvci2"
        );
        stripe.redirectToCheckout({ sessionId });
      }
    });
  };

  return (
    <div className="plansScreen">
      <br />
      {subscription && (
        <p className="plansScreen_renewal">
          Renewal data:{" "}
          {new Date(subscription?.current_period_end * 1000).toLocaleDateString(
            "Cs-cs"
          )}
        </p>
      )}
      {Object.entries(products).map(([productId, productData]) => {
        //TODO add some logic to check if the user's sub is active.
        const isCurrentPackage = productData.name
          ?.toLowerCase()
          .includes(subscription?.role);

        return (
          <div
            key={productId}
            className={`${
              isCurrentPackage && "plansScreen__plan--disabled"
            } plansScreen__plan`}
          >
            <div className="plansScreen_info">
              <h5>{productData.name}</h5>
              <h6>{productData.description}</h6>
            </div>
            <button
              onClick={() =>
                !isCurrentPackage && loadCheckout(productData.prices.priceId)
              }
            >
              {isCurrentPackage ? "Current Plan" : "Subscribe"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default PlansScreen;
