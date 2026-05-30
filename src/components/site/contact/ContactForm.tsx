"use client";

import { Send } from "lucide-react";

export function ContactForm() {
  return (
    <div className="w-full! lg:w-1/2! bg-white! p-8! md:p-10! rounded-3xl! shadow-[0_10px_40px_rgba(22,30,45,0.08)]! border! border-[#27427f]/5!">
      <h3 className="text-2xl! font-bold! text-[#161e2d]! mb-6!">Send us a Message</h3>
      
      <form className="space-y-6!">
        <div className="grid! grid-cols-1! sm:grid-cols-2! gap-6!">
          {/* Full Name */}
          <div className="space-y-2!">
            <label htmlFor="name" className="text-sm! font-semibold! text-gray-700!">
              Full Name <span className="text-red-500!">*</span>
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="John Doe"
              className="w-full! px-4! py-3.5! rounded-xl! bg-[#f8f9fa]! border! border-transparent! focus:border-[#27427f]/30! focus:bg-white! outline-none! transition-all! text-[#161e2d]! placeholder:text-gray-400!"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2!">
            <label htmlFor="email" className="text-sm! font-semibold! text-gray-700!">
              Email Address <span className="text-red-500!">*</span>
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="john@example.com"
              className="w-full! px-4! py-3.5! rounded-xl! bg-[#f8f9fa]! border! border-transparent! focus:border-[#27427f]/30! focus:bg-white! outline-none! transition-all! text-[#161e2d]! placeholder:text-gray-400!"
              required
            />
          </div>
        </div>

        <div className="grid! grid-cols-1! sm:grid-cols-2! gap-6!">
          {/* Phone */}
          <div className="space-y-2!">
            <label htmlFor="phone" className="text-sm! font-semibold! text-gray-700!">
              Phone Number <span className="text-red-500!">*</span>
            </label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              placeholder="+91 90929 65556"
              className="w-full! px-4! py-3.5! rounded-xl! bg-[#f8f9fa]! border! border-transparent! focus:border-[#27427f]/30! focus:bg-white! outline-none! transition-all! text-[#161e2d]! placeholder:text-gray-400!"
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-2!">
            <label htmlFor="subject" className="text-sm! font-semibold! text-gray-700!">
              Subject
            </label>
            <input 
              type="text" 
              id="subject" 
              name="subject" 
              placeholder="How can we help?"
              className="w-full! px-4! py-3.5! rounded-xl! bg-[#f8f9fa]! border! border-transparent! focus:border-[#27427f]/30! focus:bg-white! outline-none! transition-all! text-[#161e2d]! placeholder:text-gray-400!"
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2!">
          <label htmlFor="message" className="text-sm! font-semibold! text-gray-700!">
            Message <span className="text-red-500!">*</span>
          </label>
          <textarea 
            id="message" 
            name="message" 
            rows={5}
            placeholder="Tell us more about your requirements..."
            className="w-full! px-4! py-3.5! rounded-xl! bg-[#f8f9fa]! border! border-transparent! focus:border-[#27427f]/30! focus:bg-white! outline-none! transition-all! text-[#161e2d]! placeholder:text-gray-400! resize-none!"
            required
          ></textarea>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="w-full! sm:w-auto! inline-flex! items-center! justify-center! gap-2! px-8! py-4! rounded-xl! bg-[#ffc900]! text-[#27427f]! font-bold! tracking-wide! uppercase! hover:bg-[#27427f]! hover:text-white! transition-all! duration-300! shadow-md! hover:shadow-xl! active:scale-95!"
        >
          Send Message
          <Send className="w-4! h-4!" />
        </button>
      </form>
    </div>
  );
}
