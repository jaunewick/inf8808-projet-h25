export const MARGIN = { top: 120, right: 10, bottom: 80, left: 180 };
export const CHART_WIDTH = 1000;
export const CHART_HEIGHT = 500;

export const COLORS = {
  background: "#ffffff",
  text: {
    primary: "#000000",
    secondary: "#666666",
  },
  grid: "#374151",
  capacity: "#d0021b",
  utilization: {
    under80: "teal",
    over80: "orange",
    over100: "tomato",
  },
  categories: {
    crew: "#3b82f6",
    men: "#f59e0b",
    women: "#10b981",
    overload: "#ef4444",
    remaining: "#f5f5f5",
  },
};

export const FONTS = {
  title: {
    size: "18px",
    weight: "bold",
  },
  subtitle: {
    size: "14px",
    weight: "600",
  },
  axis: {
    size: "12px",
    weight: "500",
  },
  label: {
    size: "12px",
    weight: "400",
  },
  tooltip: {
    size: "14px",
    weight: "500",
  },
};

export const STYLES = {
  bar: {
    rx: 4,
    ry: 4,
    stroke: "white",
    strokeWidth: 0.5,
  },
  grid: {
    strokeDasharray: "3,3",
    opacity: 0.1,
  },
  capacity: {
    strokeWidth: 1.5,
    strokeDasharray: "3,3",
    opacity: 0.5,
  },
  tooltip: {
    padding: 40,
    rx: 6,
    ry: 6,
    opacity: 0.95,
  },
};
