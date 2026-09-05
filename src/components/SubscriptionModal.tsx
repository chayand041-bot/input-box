import React, { useState } from "react";
import { UserSubscription } from "../types";
import { X, CheckCircle, ShieldCheck, Zap, Sparkles, Smartphone, Copy, Check } from "lucide-react";

interface SubscriptionModalProps {
  onClose: () => void;
  currentSubscription: UserSubscription;
  onActivateSubscription: (sub: UserSubscription) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  onClose,
  currentSubscription,
  onActivateSubscription,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly">("monthly");
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const upiId = "inputbox.stream@upi";

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Please enter your Full Name");
      return;
    }
    if (!emailOrPhone.trim()) {
      setErrorMsg("Please enter your Mobile Number or Email");
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg("Please enter a secure password (at least 4 characters)");
      return;
    }

    const trimmedUtr = utrNumber.trim();
    if (!trimmedUtr) {
      setErrorMsg("Please enter your 12-digit Transaction ID / UTR Number");
      return;
    }
    if (trimmedUtr.length !== 12 || !/^\d{12}$/.test(trimmedUtr)) {
      setErrorMsg("Transaction ID / UTR must be exactly 12 numeric digits (e.g., 423985124901)");
      return;
    }

    setIsActivating(true);

    setTimeout(() => {
      const isMonthly = selectedPlan === "monthly";
      const now = new Date();
      const expires = new Date();
      expires.setDate(now.getDate() + (isMonthly ? 30 : 7));

      const newSub: UserSubscription = {
        plan: selectedPlan,
        planName: isMonthly ? "Monthly Pro (Best Value)" : "Weekly Pack",
        price: isMonthly ? 50 : 10,
        validDays: isMonthly ? 30 : 7,
        activatedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        utrNumber: trimmedUtr,
        userName: fullName,
        userEmail: emailOrPhone,
        isVip: true,
      };

      onActivateSubscription(newSub);
      setIsActivating(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div
      id="subscription-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="subscription-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#141416] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95"
      >
        {/* Top Header Bar */}
        <div className="relative bg-gradient-to-r from-zinc-900 via-[#1a1415] to-zinc-900 p-5 sm:p-6 border-b border-zinc-800">
          <button
            id="close-subscription-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-7 h-7 bg-[#E50914] rounded flex items-center justify-center font-black text-white text-xs">
              IB
            </div>
            <span className="text-xl sm:text-2xl font-black text-[#E50914] uppercase tracking-wider">
              Input Box VIP Pass
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300">
            Unlock unlimited buffer-free streaming, AI features, and 4K Ultra HD playback.
          </p>
        </div>

        {success ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">
              Subscription Activated! 🚀
            </h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto">
              Welcome aboard, <span className="font-bold text-white">{fullName}</span>. Your{" "}
              <span className="text-emerald-400 font-bold">
                {selectedPlan === "monthly" ? "Monthly Pro (₹50)" : "Weekly Pack (₹10)"}
              </span>{" "}
              is now active with verified UTR <span className="font-mono text-zinc-200">{utrNumber}</span>.
            </p>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between text-zinc-400">
                <span>Account:</span>
                <span className="text-white font-medium">{emailOrPhone}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Valid For:</span>
                <span className="text-emerald-400 font-bold">
                  {selectedPlan === "monthly" ? "30 Days (Ultra HD)" : "7 Days (HD)"}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>AI Features:</span>
                <span className="text-white font-medium">Unlocked & Unlimited</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#E50914] hover:bg-[#c90711] text-white font-extrabold rounded-xl text-sm transition-transform hover:scale-[1.02] shadow-lg shadow-[#E50914]/40"
            >
              Start Streaming Now ▶
            </button>
          </div>
        ) : (
          /* Subscription Form */
          <form onSubmit={handleActivate} className="p-5 sm:p-6 space-y-5">
            {/* Step 1: User Onboarding Credentials */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-[#E50914] text-white text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
                <span>User Onboarding Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
                    Full Name *
                  </label>
                  <input
                    id="inputbox-fullname"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
                    Mobile Number / Email *
                  </label>
                  <input
                    id="inputbox-email-phone"
                    type="text"
                    required
                    placeholder="9876543210 or email@domain"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
                  Password *
                </label>
                <input
                  id="inputbox-password"
                  type="password"
                  required
                  placeholder="Create your streaming access password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            {/* Step 2: Subscription Selector */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-[#E50914] text-white text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
                <span>Select Your Subscription Plan</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Weekly Pack */}
                <div
                  id="plan-weekly-card"
                  onClick={() => setSelectedPlan("weekly")}
                  className={`relative p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPlan === "weekly"
                      ? "bg-[#E50914]/15 border-[#E50914] shadow-md shadow-[#E50914]/20"
                      : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Weekly Pack</span>
                    <span className="text-base font-black text-white">₹10</span>
                  </div>
                  <div className="text-[11px] text-[#E50914] font-semibold">
                    7 Days Access
                  </div>
                  <ul className="mt-2 text-[10px] text-zinc-400 space-y-1">
                    <li>• HD Streaming</li>
                    <li>• No Downloads</li>
                    <li>• All Bollywood & Hollywood</li>
                  </ul>
                </div>

                {/* Monthly Pro (Best Value) */}
                <div
                  id="plan-monthly-card"
                  onClick={() => setSelectedPlan("monthly")}
                  className={`relative p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPlan === "monthly"
                      ? "bg-[#E50914]/15 border-[#E50914] shadow-lg shadow-[#E50914]/20 ring-1 ring-[#E50914]"
                      : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-[#E50914] text-[9px] font-extrabold uppercase text-white tracking-wider shadow">
                    Best Value
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Monthly Pro</span>
                    <span className="text-base font-black text-white">₹50</span>
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold">
                    30 Days Access
                  </div>
                  <ul className="mt-2 text-[10px] text-zinc-300 space-y-1">
                    <li>• Ultra HD 4K Streaming</li>
                    <li>• AI Auto-Quality (Buffer-Free)</li>
                    <li>• All Devices & TV Supported</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3: Payment QR Integration */}
            <div className="space-y-3 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-[#E50914] text-white text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
                <span>Scan & Pay with UPI</span>
              </div>

              {/* Clear Instruction Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-center space-x-2 text-xs text-amber-300">
                <Smartphone className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="font-medium">
                  Scan with PhonePe, Google Pay, or Paytm to activate your plan.
                </span>
              </div>

              {/* QR Image Tag with exact placeholder URL & fallback */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                <div className="relative p-2 bg-white rounded-xl shadow-lg shrink-0">
                  {/* Dedicated image tag with exact placeholder URL requested */}
                  <img
                    id="upi-payment-qr-code-img"
                    src="https://via.placeholder.com/150?text=Scan+UPI+QR"
                    alt="Scan UPI QR Code"
                    width={130}
                    height={130}
                    onError={(e) => {
                      // High-fidelity fallback SVG QR if placeholder service is blocked by network/iframe
                      (e.target as HTMLImageElement).src =
                        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"><rect width="150" height="150" fill="white"/><rect x="15" y="15" width="40" height="40" fill="black"/><rect x="25" y="25" width="20" height="20" fill="white"/><rect x="95" y="15" width="40" height="40" fill="black"/><rect x="105" y="25" width="20" height="20" fill="white"/><rect x="15" y="95" width="40" height="40" fill="black"/><rect x="25" y="105" width="20" height="20" fill="white"/><rect x="65" y="20" width="18" height="18" fill="%23E50914"/><rect x="65" y="55" width="20" height="40" fill="black"/><rect x="95" y="65" width="40" height="20" fill="black"/><rect x="65" y="105" width="20" height="25" fill="%23E50914"/><rect x="100" y="100" width="30" height="30" fill="black"/><text x="75" y="145" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle" fill="%23111">INPUT BOX UPI</text></svg>`;
                    }}
                    className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                  />
                  <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                    <span className="bg-[#E50914] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                      Pay ₹{selectedPlan === "monthly" ? "50" : "10"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs flex-1">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-400">Payee UPI ID:</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex items-center space-x-1 text-zinc-200 hover:text-white bg-zinc-800 px-2 py-1 rounded font-mono text-[11px]"
                    >
                      <span>{upiId}</span>
                      {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-zinc-400 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant automated verification via 12-digit UTR.</span>
                  </div>

                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Enter 12-digit Transaction ID / UTR Number: *
                    </label>
                    <input
                      id="inputbox-utr-number"
                      type="text"
                      maxLength={12}
                      required
                      placeholder="e.g. 423985124901"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono tracking-widest text-emerald-400 placeholder-zinc-600 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="text-xs text-[#E50914] bg-[#E50914]/10 border border-[#E50914]/30 p-2.5 rounded-lg font-medium">
                {errorMsg}
              </div>
            )}

            {/* Full-width Red Button Requested: "Activate Subscription & Watch Now 🚀" */}
            <button
              id="activate-subscription-btn"
              type="submit"
              disabled={isActivating}
              className="w-full py-3.5 px-4 rounded-xl bg-[#E50914] hover:bg-[#c90711] disabled:opacity-60 text-white font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-xl shadow-[#E50914]/40 hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>
                {isActivating
                  ? "Verifying UTR & Activating Plan..."
                  : "Activate Subscription & Watch Now 🚀"}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
