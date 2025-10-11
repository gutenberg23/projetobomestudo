import AdBanner from "@/components/ads/AdBanner";

interface CourseAdBannerProps {
  className?: string;
}

const CourseAdBanner = ({ className = "" }: CourseAdBannerProps) => {
  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div className="max-w-[1400px] w-full px-[10px] md:px-[32px] py-4">
        <AdBanner position="course_navigation" className="w-full" />
      </div>
    </div>
  );
};

export default CourseAdBanner;