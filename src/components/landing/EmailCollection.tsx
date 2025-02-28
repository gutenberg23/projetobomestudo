
import React from "react";
import { Mail } from "lucide-react";

export const EmailCollection = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto text-center">
        <Mail className="w-12 h-12 text-[rgba(241,28,227,1)] mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold text-[rgba(38,47,60,1)] mb-4">
          Subscribe to our newsletter
        </h2>
        <p className="text-gray-600 mb-8">
          Stay up to date with the latest news, announcements, and articles.
        </p>
        <form className="flex flex-col md:flex-row gap-4 justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-6 py-4 rounded-lg border border-gray-300 flex-1 max-w-md"
          />
          <button
            type="submit"
            className="bg-[rgba(241,28,227,1)] text-white px-8 py-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};
