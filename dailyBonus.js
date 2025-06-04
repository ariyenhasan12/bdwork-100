export function renderDailyBonusButton(containerId = "dailyBonusContainer") {
  const container = document.getElementById(containerId);
  if (!container) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      container.innerHTML = `
        <section class="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 text-black mt-4 py-2 px-2 shadow-lg border border-yellow-400 rounded-md">
          <div class="flex items-center justify-between text-sm sm:text-base font-medium">
            <div class="flex items-center gap-2">
              <span class="text-xl">🎉</span>
              <div>
                <p class="text-sm sm:text-base font-semibold text-purple-800">Daily Bonus</p>
                <p class="text-xs sm:text-sm text-gray-700">
                  Login to claim your bonus.
                </p>
              </div>
            </div>
            <div class="ml-4">
              <button disabled class="w-28 px-1 py-2 rounded-md font-semibold shadow inline-flex items-center justify-center gap-2 text-white bg-gray-400">
                <i class="fa-solid fa-gift"></i>
                <span>Login</span>
              </button>
            </div>
          </div>
        </section>
      `;
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

      let buttonText = "";
      let buttonDisabled = true;

      if (!isPro) {
        buttonText = "Pro Only";
      } else if (isSameDay(lastClaimDate, now)) {
        buttonText = "Already Claimed";
      } else {
        buttonText = `Claim ৳${dailyBonus}`;
        buttonDisabled = false;
      }

      container.innerHTML = `
        <section class="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 text-black mt-4 py-2 px-2 shadow-lg border border-yellow-400 rounded-md">
          <div class="flex items-center justify-between text-sm sm:text-base font-medium">
            <div class="flex items-center gap-2">
              <span class="text-xl">🎉</span>
              <div>
                <p class="text-sm sm:text-base font-semibold text-purple-800">Daily Bonus Available</p>
                <p class="text-xs sm:text-sm text-gray-700">
                  Pro Account users can claim <span class="text-green-800 font-bold">৳${dailyBonus}</span> today!
                </p>
              </div>
            </div>
            <div class="ml-4">
              <button id="claimBonusBtn" class="w-28 px-1 py-2 rounded-md font-semibold shadow inline-flex items-center justify-center gap-2 text-white ${buttonDisabled ? 'bg-gray-400' : 'bg-gradient-to-r from-pink-500 to-purple-600'}" ${buttonDisabled ? 'disabled' : ''}>
                <i class="fa-solid fa-gift"></i>
                <span>${buttonText}</span>
              </button>
            </div>
          </div>
        </section>
      `;

      if (!buttonDisabled) {
        const claimBtn = document.getElementById("claimBonusBtn");
        claimBtn.onclick = async () => {
          try {
            const newBalance = (userData.balance || 0) + dailyBonus;
            await updateDoc(userRef, {
              balance: newBalance,
              lastBonusClaim: Timestamp.fromDate(new Date())
            });
            claimBtn.innerHTML = `<i class="fa-solid fa-check"></i><span>Bonus Claimed!</span>`;
            claimBtn.disabled = true;
            claimBtn.classList.remove("bg-gradient-to-r", "from-pink-500", "to-purple-600");
            claimBtn.classList.add("bg-gray-400");
            alert(`You received ৳${dailyBonus} as daily bonus.`);
          } catch (err) {
            alert("Error claiming bonus: " + err.message);
          }
        };
      }

    } catch (error) {
      console.error(error);
      container.innerHTML = `<p class="text-red-600">Error loading bonus info.</p>`;
    }
  });
}
