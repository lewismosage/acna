import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "yellow";
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  trend,
  trendDirection = "neutral",
}: StatsCardProps) => {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        text: "text-blue-600",
        bg: "bg-blue-100",
        icon: "text-blue-600",
      },
      green: {
        text: "text-green-600",
        bg: "bg-green-100",
        icon: "text-green-600",
      },
      purple: {
        text: "text-purple-600",
        bg: "bg-purple-100",
        icon: "text-purple-600",
      },
      orange: {
        text: "text-orange-600",
        bg: "bg-orange-100",
        icon: "text-orange-600",
      },
      red: {
        text: "text-red-600",
        bg: "bg-red-100",
        icon: "text-red-600",
      },
      yellow: {
        text: "text-yellow-600",
        bg: "bg-yellow-100",
        icon: "text-yellow-600",
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500 mr-1" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500 mr-1" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-500 mr-1" />;
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const colors = getColorClasses(color);

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${colors.text}`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`p-3 ${colors.bg} rounded-full`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center">
          {getTrendIcon()}
          <span className={`text-xs ${getTrendColor()}`}>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
