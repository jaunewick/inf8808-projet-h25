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
    under80: "#1D3557",
    over80: "#d4a951",
    over100: "#E63946",
  },
  categories: {
    crew: "#",
    men: "#1D3557",
    women: "#2A9D8F",
    overload: "#E63946",
    remaining: "#c8c8c8",
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
    opacity: 0,
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
