import SectionLabel from "@/components/shared/SectionLabel";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-black pt-32 pb-24 md:py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/media/2021/04/lets-plan.png')] bg-cover bg-center" />
        <div className="container relative z-10 text-center">
          <SectionLabel className="text-white border-white/20 bg-white/10 mx-auto">Get in Touch</SectionLabel>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8">
            Contact <span className="text-brand">Transit Education</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Have questions? We're here to help. Reach out to any of our branches or send us a message.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-16">
            {/* Left: Info */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-black mb-8">Visit Our Offices</h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">Kathmandu (Head Office)</h3>
                      <p className="text-gray-600 mb-1">Putalisadak, Kathmandu, Nepal</p>
                      <p className="text-gray-500 text-sm">Opposite to Kumari Bank</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">Call Us</h3>
                      <p className="text-gray-600 mb-1">+977-1-4444555, 4444556</p>
                      <p className="text-gray-600">+977 9851315991 (WhatsApp)</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">Email Us</h3>
                      <p className="text-gray-600 mb-1">info@transiteducation.com.np</p>
                      <p className="text-gray-600">admissions@transiteducation.com.np</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">Working Hours</h3>
                      <p className="text-gray-600 mb-1">Sunday - Friday: 10:00 AM - 6:00 PM</p>
                      <p className="text-gray-500 text-sm">Saturday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brand p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">Chat with an Expert</h3>
                  <p className="text-white/80 mb-8">Get instant answers to your study abroad queries via WhatsApp.</p>
                  <a 
                    href="https://wa.me/9779851315991" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-brand px-8 py-4 rounded-full font-bold hover:bg-black hover:text-white transition-all shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" /> Start Chat
                  </a>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-7">
              <div className="bg-off-white p-10 md:p-16 rounded-[3rem] border border-gray-100 shadow-sm">
                <h2 className="text-3xl font-bold text-black mb-8">Send Us a Message</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com" 
                        className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="+977-9800000000" 
                        className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Subject</label>
                      <select className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all appearance-none">
                        <option>General Inquiry</option>
                        <option>Visa Consulting</option>
                        <option>Admission Support</option>
                        <option>Scholarships</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Your Message</label>
                    <textarea 
                      rows={6}
                      placeholder="How can we help you?"
                      className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none"
                    ></textarea>
                  </div>

                  <button className={cn(buttonVariants({ variant: "brand" }), "w-full py-5 rounded-2xl text-lg flex items-center justify-center gap-3")}>
                    <Send className="w-5 h-5" /> Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[500px] w-full bg-gray-200">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.4829241908044!2d85.32168931506191!3d27.702302982793264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1907b22a0001%3A0x6b876d750a9840!2sTransit%20Education%20Network!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={true} 
          loading="lazy"
        ></iframe>
      </section>
    </main>
  );
}
