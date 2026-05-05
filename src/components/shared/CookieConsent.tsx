"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-8 right-8 md:left-auto md:w-[400px] z-[9998]"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                <Cookie size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black mb-2">We value your privacy</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="brand" 
                onClick={handleAccept}
                className="flex-1 rounded-xl py-6"
              >
                Accept All
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDecline}
                className="flex-1 rounded-xl py-6 border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                Reject
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
