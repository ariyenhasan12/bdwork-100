export function showBonusBanner(amount) {
  const banner = document.getElementById("bonusBanner");
  banner.innerHTML = `
    <div class="flex justify-between items-center w-full px-4 py-3">
      <div class="text-sm font-medium">🎁 You have a bonus of ৳<span>${amount}</span> to claim!</div>
      <button onclick="receiveBonus()" class="ml-4 bg-white text-blue-700 font-semibold px-3 py-1 rounded hover:bg-gray-100 transition">
        Receive Bonus
      </button>
    </div>
  `;
  banner.classList.remove("hidden");
}

export function hideBonusBanner() {
  document.getElementById("bonusBanner").classList.add("hidden");
}
