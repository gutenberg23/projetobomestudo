
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Testimonials = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[rgba(38,47,60,1)]">
            What everyone says
          </h2>
          <div className="flex gap-4">
            <button className="p-2 rounded-full border border-[rgba(241,28,227,1)] text-[rgba(241,28,227,1)]">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full border border-[rgba(241,28,227,1)] text-[rgba(241,28,227,1)]">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              text: "Lacus vestibulum ultricies mi risus, duis non, volutpat nullam non. Magna congue nisi maecenas elit aliquet eu sed consectetur. Vitae quis cras vitae praesent morbi adipiscing purus consectetur mi.",
              name: "Hellen Jummy",
              role: "Financial Counselor",
              image: "https://i.pravatar.cc/100?img=1",
            },
            {
              text: "Odio rhoncus ornare ut quam. Molestie vel duis quis scelerisque ut id. In tortor turpis viverra sagittis ultrices nisi, nec tortor. Vestibulum, ultrices ultricies neque, hac ultricies dolor.",
              name: "Ralph Edwards",
              role: "Math Teacher",
              image: "https://i.pravatar.cc/100?img=2",
            },
            {
              text: "Sagittis nunc egestas leo et malesuada urna risus. Morbi proin et cras aliquam. Diam tellus, amet, hac imperdiet. Tellus mi volutpat tellus, congue malesuada sit nisl donec a.",
              name: "Hellena John",
              role: "Psychology Student",
              image: "https://i.pravatar.cc/100?img=3",
            },
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-lg">
              <p className="text-gray-600 mb-6">{testimonial.text}</p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-bold text-[rgba(38,47,60,1)]">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
