// dailyBonus.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCkYWvYNsg2-CR88Js6gcP2nXfvwI4TW30",
  authDomain: "bdwork-346d3.firebaseapp.com",
  projectId: "bdwork-346d3",
  storageBucket: "bdwork-346d3.appspot.com",
  messagingSenderId: "900963179093",
  appId: "1:900963179093:web:81e42d67bb31d603cc92dc",
  measurementId: "G-FM1YJ8E5GK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exported function
export function renderDailyBonusButton(containerId = "dailyBonusContainer") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section class="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 text-black mt-4 py-2 px-2 shadow-lg border border-yellow-400 rounded-md">
          <div class="flex items-center justify-between text-sm sm:text-base font-medium">
            <div class="flex items-center gap-2">
              <span class="text-xl">🎉</span>
              <div>
                <p class="text-sm sm:text-base font-semibold text-purple-800">Daily Bonus Available</p>
                <p class="text-xs sm:text-sm text-gray-700">
                  Pro Account users can claim <span class="text-green-800 font-bold">৳${amount}</span> today!
                </p>
              </div>
            </div>
            <div class="ml-4">
              <button id="claimBonusBtn" class="w-28 px-1 py-2 rounded-md font-semibold shadow inline-flex items-center justify-center gap-2 text-white bg-gradient-to-r from-pink-500 to-purple-600">
                <i class="fa-solid fa-gift"></i>
                <span>Claim Now</span>
              </button>
            </div>
          </div>
        </section>
  `;

  const claimBtn = document.getElementById("claimBonusBtn");
  claimBtn.disabled = true;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      claimBtn.innerText = "Login to Claim";
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const settingsRef = doc(db, "settings", "proAccount");
      const settingsSnap = await getDoc(settingsRef);
      const settings = settingsSnap.data();

      const dailyBonus = settings.dailyBonus || 0;

      const now = new Date();
      const lastClaimDate = userData.lastBonusClaim?.toDate?.() ?? new Date(userData.lastBonusClaim || 0);

      const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      const isPro = userData.isPro === true &&
        new Date(userData.proExpiryTimestamp?.toDate?.() ?? userData.proExpiryTimestamp) > now;

      if (!isPro) {
        claimBtn.innerText = "Pro Only";
        return;
      }

      if (isSameDay(lastClaimDate, now)) {
        claimBtn.innerText = "Already Claimed Today";
        claimBtn.disabled = true;
      } else {
        claimBtn.innerText = `Claim ৳${dailyBonus}`;
        claimBtn.disabled = false;

        claimBtn.onclick = async () => {
          try {
            const newBalance = (userData.balance || 0) + dailyBonus;
            await updateDoc(userRef, {
              balance: newBalance,
              lastBonusClaim: Timestamp.fromDate(new Date())
            });
            claimBtn.innerText = "Bonus Claimed!";
            claimBtn.disabled = true;
            alert(`You received ৳${dailyBonus} as daily bonus.`);
          } catch (err) {
            alert("Error claiming bonus: " + err.message);
          }
        };
      }

    } catch (error) {
      claimBtn.innerText = "Error Loading";
      console.error(error);
    }
  });
}
