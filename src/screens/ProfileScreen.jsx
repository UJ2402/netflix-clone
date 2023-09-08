import { useEffect, useState } from "react";
import "./ProfileScreen.css";
import Nav from "../Nav";
import { selectUser } from "../features/userSlice";
import { useSelector } from "react-redux";
import db, { auth } from "../firebaseApp";
import PlansScreen from "./PlansScreen";
import { query, collection, onSnapshot } from "firebase/firestore";

function ProfileScreen() {
  const user = useSelector(selectUser);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "customers", user.uid, "subsriptions"));

    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach(async (subscription) => {
        setSubscription(subscription.data().role);
      });
    });
  }, [user.uid]);

  return (
    <div className="profileScreen">
      <Nav />
      <div className="profileScreen_body">
        <h1>Edit Profile</h1>
        <div className="profileScreen_info">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png?20201013161117"
            alt=""
          />
          <div className="profileScreen_details">
            <h2>{user.email}</h2>
          </div>
          <div className="proifleScreen_plans">
            <div className="profileScreen_plansHeading">
              <h3> {`Plans`} </h3>
              {subscription ? (
                <p>{`(Current: ${subscription})`}</p>
              ) : (
                <p>{`Not subscribed`}</p>
              )}
            </div>

            <PlansScreen />
            <button
              onClick={() => auth.signOut()}
              className="profileScreen_signOut"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;
