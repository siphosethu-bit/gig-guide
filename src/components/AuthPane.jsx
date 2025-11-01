import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Mail, User, Phone, MapPin, Sparkles, Megaphone, RefreshCw, X
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  signOut,
  reload,
} from "firebase/auth";
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, addDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const glass = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl";

/* ---------- Premium glass loader overlay ---------- */
function GigLoadingOverlay({ message = "Working…" }) {
  return (
    <AnimatePresence>
      <motion.div
        key="gg-loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[110] grid place-items-center bg-black/70 backdrop-blur"
        aria-busy="true"
        aria-live="polite"
      >
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative w-72 h-72 rounded-3xl border border-white/10 bg-white/5 shadow-2xl overflow-hidden"
        >
          {/* Rings */}
          <motion.div
            className="absolute inset-0 m-8 rounded-full border-2 border-white/15 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 m-14 rounded-full border-2 border-white/15 border-b-transparent"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 6.2, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 m-20 rounded-full border-2 border-white/15 border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 7.8, ease: "linear" }}
          />

          {/* Orbit dots */}
          <motion.div
            className="absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full bg-amber-300/90 shadow-[0_0_18px_4px_rgba(251,191,36,0.45)]"
            style={{ transformOrigin: "64px 0px" }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full bg-white/80"
            style={{ transformOrigin: "92px 0px" }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 3.1, ease: "linear" }}
          />

          {/* Center mark & text */}
          <div className="absolute inset-0 grid place-items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: [0.9, 1, 0.9], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-5 w-5 text-amber-300" />
              <span className="text-white/90 font-semibold tracking-wide">
                {message}
              </span>
            </motion.div>
            <div className="mt-2 text-xs text-white/60">SA Gig Guide</div>
          </div>

          {/* Soft highlight */}
          <div className="pointer-events-none absolute -inset-10 bg-gradient-to-b from-amber-300/10 via-transparent to-transparent" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
/* -------------------------------------------------- */

export default function AuthPane({ open, onClose, onAuthChange }) {
  const [tab, setTab] = useState("login"); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // shared
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  // signup-only
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [roleChoice, setRoleChoice] = useState("attendee"); // attendee | organizer

  // verification helpers
  const [verifySent, setVerifySent] = useState(false);

  // 🔔 glass notification state
  const [notice, setNotice] = useState(null); // string | null

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      const roleSnap = await getDoc(doc(db, "userRoles", u.uid));
      const role = roleSnap.exists() ? roleSnap.data().role : "";
      onAuthChange?.(u, role);
    });
    return unsub;
  }, [onAuthChange]);

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pwd);

      // if not verified, block access and offer resend
      if (!cred.user.emailVerified) {
        setVerifySent(false);
        setErr("Your email is not verified yet. Please verify to continue.");
        await signOut(auth);
        return;
      }

      onClose?.();
    } catch (e) {
      setErr(prettyAuthError(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pwd);
      await updateProfile(cred.user, { displayName: fullName });

      // create unverified profile
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: fullName,
        email,
        phone,
        city,
        requestedRole: roleChoice,
        status: "unverified",
        createdAt: serverTimestamp(),
      });

      // mark unverified role initially
      await setDoc(doc(db, "userRoles", cred.user.uid), { role: "unverified" });

      // send verification email
      await sendEmailVerification(cred.user);
      setVerifySent(true);
      setTab("login");
      setNotice("Verification email sent. Please check your inbox."); // 🔔

    } catch (e) {
      setErr(prettyAuthError(e));
    } finally {
      setLoading(false);
    }
  }

  async function confirmVerified() {
    setLoading(true);
    setErr("");
    try {
      if (!auth.currentUser) {
        setErr("Please sign in first.");
        return;
      }
      await reload(auth.currentUser);
      const u = auth.currentUser;

      if (!u.emailVerified) {
        setErr("Still not verified. Please click the link in your email.");
        return;
      }

      // flip role and status now that email is verified
      const userRef = doc(db, "users", u.uid);
      const roleRef = doc(db, "userRoles", u.uid);

      const userSnap = await getDoc(userRef);
      const requestedRole = userSnap.exists() ? userSnap.data().requestedRole : "attendee";

      await updateDoc(userRef, { status: "active" });

      if (requestedRole === "attendee") {
        await setDoc(roleRef, { role: "attendee" });
      } else {
        await setDoc(roleRef, { role: "organizer-pending" });
        await addDoc(collection(db, "organizerApplications"), {
          uid: u.uid,
          name: u.displayName || userSnap.data()?.name || "",
          email: u.email,
          phone: userSnap.data()?.phone || "",
          city: userSnap.data()?.city || "",
          status: "pending",
          submittedAt: serverTimestamp(),
        });
      }

      setNotice("Email verified! You’re good to go."); // 🔔
      onClose?.();
    } catch (e) {
      setErr(prettyAuthError(e));
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setLoading(true);
    setErr("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pwd);
      await sendEmailVerification(cred.user);
      await signOut(auth);
      setVerifySent(true);
      setNotice("Verification email resent. Please check your inbox."); // 🔔
    } catch (e) {
      setErr(prettyAuthError(e));
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* 🔔 Glass toast */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed top-4 left-4 z-[120]"
          >
            <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur px-4 py-3 shadow-xl text-sm text-white min-w-[260px] max-w-[360px]">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-[2px]">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <div className="flex-1 leading-snug">
                  {notice}
                </div>
                <button
                  aria-label="Dismiss"
                  className="ml-2 rounded-md border border-white/10 bg-white/10 hover:bg-white/20 p-1"
                  onClick={() => setNotice(null)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌟 Premium loader while busy */}
      {loading && (
        <GigLoadingOverlay
          message={tab === "login" ? "Signing you in…" : "Creating your account…"}
        />
      )}

      {/* Auth overlay */}
      <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur grid place-items-center px-4">
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          className={`w-[min(980px,100%)] ${glass} p-6 sm:p-8`}>

          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome to SA Gig Guide
            </h2>
          </div>

          <div className="flex gap-2 mb-5">
            <button
              className={`px-4 py-2 rounded-full border ${tab==="login" ? "bg-white text-black border-white" : "border-white/20 bg-white/10 text-white"}`}
              onClick={() => setTab("login")}
            >
              Log in
            </button>
            <button
              className={`px-4 py-2 rounded-full border ${tab==="signup" ? "bg-white text-black border-white" : "border-white/20 bg-white/10 text-white"}`}
              onClick={() => setTab("signup")}
            >
              Sign up
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                onSubmit={handleLogin}
                className="grid sm:grid-cols-2 gap-4"
              >
                <div className={`${glass} p-4 sm:col-span-2`}>
                  <label className="text-xs text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </label>
                  <input className="w-full mt-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                    type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
                  <label className="text-xs text-slate-300 flex items-center gap-2 mt-3">
                    <Lock className="h-4 w-4" /> Password
                  </label>
                  <input className="w-full mt-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                    type="password" required value={pwd} onChange={e=>setPwd(e.target.value)} />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-2">
                  <button disabled={loading} className="px-5 py-2.5 rounded-xl border border-white/15 bg-white text-black">
                    Log in
                  </button>
                  <button type="button" onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/15">
                    Cancel
                  </button>

                  {/* If login blocked because unverified */}
                  {err.includes("not verified") && (
                    <>
                      <button type="button" disabled={loading}
                        onClick={resendVerification}
                        className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/15 inline-flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" /> Resend verification
                      </button>
                      {verifySent && (
                        <button type="button" disabled={loading}
                          onClick={confirmVerified}
                          className="px-5 py-2.5 rounded-xl border border-white/15 bg-white text-black">
                          I’ve verified — Continue
                        </button>
                      )}
                    </>
                  )}
                </div>

                {err && <div className="sm:col-span-2 text-sm text-rose-300">{err}</div>}
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                onSubmit={handleSignup}
                className="grid md:grid-cols-2 gap-4"
              >
                <div className={`${glass} p-4`}>
                  <label className="text-xs text-slate-300 flex items-center gap-2"><User className="h-4 w-4" /> Full name</label>
                  <input className="w-full mt-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                    required value={fullName} onChange={e=>setFullName(e.target.value)} />
                  <label className="text-xs text-slate-300 flex items-center gap-2 mt-3"><Mail className="h-4 w-4" /> Email</label>
                  <input className="w-full mt-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2" type="email"
                    required value={email} onChange={e=>setEmail(e.target.value)} />
                  <label className="text-xs text-slate-300 flex items-center gap-2 mt-3"><Lock className="h-4 w-4" /> Password</label>
                  <input className="w-full mt-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2" type="password"
                    required value={pwd} onChange={e=>setPwd(e.target.value)} />
                </div>

                <div className={`${glass} p-4`}>
                  <label className="text-xs text-slate-300 flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</label>
                  <input className="w-full mt-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2"
                    value={phone} onChange={e=>setPhone(e.target.value)} />
                  <label className="text-xs text-slate-300 flex items-center gap-2 mt-3"><MapPin className="h-4 w-4" /> City</label>
                  <input className="w-full mt-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2"
                    value={city} onChange={e=>setCity(e.target.value)} />

                  <div className="mt-3">
                    <div className="text-xs text-slate-300 mb-1">I’m signing up as</div>
                    <div className="flex gap-2">
                      <button type="button"
                        className={`px-4 py-2 rounded-full border ${roleChoice==="attendee" ? "bg-white text-black border-white" : "border-white/20 bg-white/10 text-white"}`}
                        onClick={()=>setRoleChoice("attendee")}
                      >
                        <User className="inline h-4 w-4 mr-1" /> Attendee
                      </button>
                      <button type="button"
                        className={`px-4 py-2 rounded-full border ${roleChoice==="organizer" ? "bg-white text-black border-white" : "border-white/20 bg-white/10 text-white"}`}
                        onClick={()=>setRoleChoice("organizer")}
                      >
                        <Megaphone className="inline h-4 w-4 mr-1" /> Organizer
                      </button>
                    </div>
                    {roleChoice==="organizer" && (
                      <p className="text-[12px] text-slate-300 mt-2">
                        We’ll verify your organizer details (≈3–4 days). When approved, we’ll email you a one-time password to unlock organizer tools.
                      </p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <button disabled={loading} className="px-5 py-2.5 rounded-xl border border-white/15 bg-white text-black">
                    Create account
                  </button>
                  <button type="button" onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/15">
                    Cancel
                  </button>
                </div>

                {verifySent && (
                  <div className="md:col-span-2 text-sm text-emerald-300">
                    Verification email sent. Check your inbox and then log in.
                  </div>
                )}
                {err && <div className="md:col-span-2 text-sm text-rose-300">{err}</div>}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

function prettyAuthError(e) {
  const code = e?.code || "";
  if (code.includes("auth/configuration-not-found")) return "Email/Password sign-in is not enabled in Firebase Authentication.";
  if (code.includes("auth/invalid-email")) return "That email doesn’t look valid.";
  if (code.includes("auth/email-already-in-use")) return "This email is already in use.";
  if (code.includes("auth/weak-password")) return "Please choose a stronger password.";
  if (code.includes("auth/wrong-password")) return "Incorrect password.";
  if (code.includes("auth/user-not-found")) return "No account with that email.";
  return e?.message || "Something went wrong.";
}
