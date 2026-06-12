const BASE_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api';

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const walletBalance = document.getElementById("walletBalance");
const pendingBalance = document.getElementById("pendingBalance");
const walletType = document.getElementById("walletType");
const walletMessage = document.getElementById("walletMessage");
const transactionsList = document.getElementById("transactionsList");

if (!token || !user) {
  window.location.href = "../index.html";
}

const money = (value) => {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `INR ${Math.round(safeAmount).toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});

const showMessage = (message) => {
  walletMessage.textContent = message;
  walletMessage.classList.remove("hidden");
};

const hideMessage = () => {
  walletMessage.classList.add("hidden");
};

const isCreditTransaction = (transaction) => {
  const type = String(transaction.transaction_type || "").toUpperCase();
  return type.includes("REFUND") || type.includes("CREDIT") || type.includes("EARNING");
};

const renderTransactions = (transactions) => {
  transactionsList.innerHTML = "";

  if (!Array.isArray(transactions) || transactions.length === 0) {
    showMessage("No wallet transactions yet.");
    return;
  }

  hideMessage();

  transactions.forEach((transaction) => {
    const credit = isCreditTransaction(transaction);
    const amountPrefix = credit ? "+" : "-";
    const card = document.createElement("article");
    card.className = `transaction-card ${credit ? "credit" : "debit"}`;
    card.innerHTML = `
      <div class="transaction-title">
        <h3>${transaction.transaction_type || "Transaction"}</h3>
        <p>${transaction.description || "Wallet activity"}</p>
        <p class="transaction-meta">
          ${formatDate(transaction.created_at)}
          ${transaction.reference_id ? ` | Ref: ${transaction.reference_id}` : ""}
        </p>
      </div>
      <div class="transaction-amount">${amountPrefix}${money(transaction.amount)}</div>
    `;
    transactionsList.appendChild(card);
  });
};

const loadWallet = async () => {
  showMessage("Loading wallet...");

  try {
    const [walletResponse, transactionsResponse] = await Promise.all([
      fetch(`${BASE_URL}/finance/wallet`, { headers: authHeaders() }),
      fetch(`${BASE_URL}/finance/transactions`, { headers: authHeaders() })
    ]);

    const walletData = await walletResponse.json();
    const transactionsData = await transactionsResponse.json();

    if (!walletData.success) {
      throw new Error(walletData.message || "Unable to load wallet.");
    }

    const wallet = walletData.data || {};
    walletBalance.textContent = money(wallet.balance);
    pendingBalance.textContent = money(wallet.pending_balance);
    walletType.textContent = `${wallet.wallet_type || "USER"} wallet`;

    if (!transactionsData.success) {
      throw new Error(transactionsData.message || "Unable to load transactions.");
    }

    renderTransactions(transactionsData.data);
  } catch (error) {
    console.error(error);
    transactionsList.innerHTML = "";
    showMessage(error.message || "Unable to load wallet right now.");
  }
};

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../index.html";
});

refreshBtn.addEventListener("click", loadWallet);

document.addEventListener("DOMContentLoaded", loadWallet);
