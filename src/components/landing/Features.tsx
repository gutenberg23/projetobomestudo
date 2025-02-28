
import React from "react";
import { Users, Building2, Users2 } from "lucide-react";

export const Features = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-white">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[rgba(38,47,60,1)] mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </h2>
        <p className="text-gray-600">Lorem ipsum dolor sit amet</p>
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <Users className="w-12 h-12 text-[rgba(241,28,227,1)]" />,
            title: "Membership Organizations",
            description:
              "Our membership management software provides full automation of membership renewals and payments",
          },
          {
            icon: <Building2 className="w-12 h-12 text-[rgba(241,28,227,1)]" />,
            title: "National Associations",
            description:
              "Our membership management software provides full automation of membership renewals and payments",
          },
          {
            icon: <Users2 className="w-12 h-12 text-[rgba(241,28,227,1)]" />,
            title: "Clubs And Groups",
            description:
              "Our membership management software provides full automation of membership renewals and payments",
          },
        ].map((feature, index) => (
          <div key={index} className="text-center p-6">
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-[rgba(38,47,60,1)] mb-4">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
