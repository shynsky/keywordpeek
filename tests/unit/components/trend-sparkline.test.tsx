import { describe, it, expect } from "vitest";
import { render, screen } from "../../utils";
import { TrendSparkline, TrendIndicator, TrendChange } from "@/components/trend-sparkline";
import { createGrowingTrend, createDecliningTrend, createMockTrendData } from "../../utils";

describe("TrendSparkline", () => {
  describe("empty state", () => {
    it("shows 'No data' message for empty array", () => {
      render(<TrendSparkline data={[]} />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });

    it("shows 'No data' for undefined data", () => {
      render(<TrendSparkline data={undefined as never} />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });
  });

  describe("SVG rendering", () => {
    it("renders SVG for valid data", () => {
      const data = createMockTrendData([100, 150, 200, 250, 300, 350]);
      const { container } = render(<TrendSparkline data={data} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders path element for line", () => {
      const data = createMockTrendData([100, 150, 200, 250, 300, 350]);
      const { container } = render(<TrendSparkline data={data} />);
      const paths = container.querySelectorAll("path");
      expect(paths.length).toBeGreaterThanOrEqual(1);
    });

    it("renders end dot circle", () => {
      const data = createMockTrendData([100, 150, 200]);
      const { container } = render(<TrendSparkline data={data} />);
      const circles = container.querySelectorAll("circle");
      expect(circles.length).toBe(1);
    });
  });

  describe("trend detection", () => {
    it("shows up indicator for growing trend (>10% increase)", () => {
      const data = createGrowingTrend(1000, 30, 6); // 30% growth
      render(<TrendSparkline data={data} showTrendIndicator />);
      expect(screen.getByTestId("icon-trending-up")).toBeInTheDocument();
    });

    it("shows down indicator for declining trend (<-10% decrease)", () => {
      const data = createDecliningTrend(1000, 30, 6); // 30% decline
      render(<TrendSparkline data={data} showTrendIndicator />);
      expect(screen.getByTestId("icon-trending-down")).toBeInTheDocument();
    });

    it("shows stable indicator for flat trend (-10% to 10%)", () => {
      const data = createMockTrendData([1000, 1000, 1000, 1000, 1000, 1000]);
      render(<TrendSparkline data={data} showTrendIndicator />);
      expect(screen.getByTestId("icon-minus")).toBeInTheDocument();
    });
  });

  describe("single data point", () => {
    it("renders without error for single data point", () => {
      const data = [{ year: 2024, month: 1, volume: 1000 }];
      const { container } = render(<TrendSparkline data={data} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("shows stable trend for single data point", () => {
      const data = [{ year: 2024, month: 1, volume: 1000 }];
      render(<TrendSparkline data={data} showTrendIndicator />);
      expect(screen.getByTestId("icon-minus")).toBeInTheDocument();
    });
  });

  describe("showTrendIndicator prop", () => {
    it("shows indicator when showTrendIndicator is true", () => {
      const data = createMockTrendData([100, 200, 300, 400, 500, 600]);
      render(<TrendSparkline data={data} showTrendIndicator />);
      expect(screen.getByTestId("icon-trending-up")).toBeInTheDocument();
    });

    it("hides indicator when showTrendIndicator is false", () => {
      const data = createMockTrendData([100, 200, 300, 400, 500, 600]);
      render(<TrendSparkline data={data} showTrendIndicator={false} />);
      expect(screen.queryByTestId("icon-trending-up")).not.toBeInTheDocument();
    });
  });

  describe("dimensions", () => {
    it("applies custom width and height", () => {
      const data = createMockTrendData([100, 200, 300]);
      const { container } = render(<TrendSparkline data={data} width={120} height={40} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "120");
      expect(svg).toHaveAttribute("height", "40");
    });

    it("uses default dimensions", () => {
      const data = createMockTrendData([100, 200, 300]);
      const { container } = render(<TrendSparkline data={data} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "80");
      expect(svg).toHaveAttribute("height", "24");
    });
  });
});

describe("TrendIndicator", () => {
  it("renders up icon for 'up' trend", () => {
    render(<TrendIndicator trend="up" />);
    expect(screen.getByTestId("icon-trending-up")).toBeInTheDocument();
  });

  it("renders down icon for 'down' trend", () => {
    render(<TrendIndicator trend="down" />);
    expect(screen.getByTestId("icon-trending-down")).toBeInTheDocument();
  });

  it("renders minus icon for 'stable' trend", () => {
    render(<TrendIndicator trend="stable" />);
    expect(screen.getByTestId("icon-minus")).toBeInTheDocument();
  });

  it("has 'Trending up' title for up trend", () => {
    const { container } = render(<TrendIndicator trend="up" />);
    expect(container.firstChild).toHaveAttribute("title", "Trending up");
  });

  it("has 'Trending down' title for down trend", () => {
    const { container } = render(<TrendIndicator trend="down" />);
    expect(container.firstChild).toHaveAttribute("title", "Trending down");
  });

  it("has 'Stable' title for stable trend", () => {
    const { container } = render(<TrendIndicator trend="stable" />);
    expect(container.firstChild).toHaveAttribute("title", "Stable");
  });
});

describe("TrendChange", () => {
  it("shows dash for less than 2 data points", () => {
    render(<TrendChange data={[{ year: 2024, month: 1, volume: 100 }]} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows positive percentage for growing trend", () => {
    // First 3 months avg: (100+150+200)/3 = 150
    // Last 3 months avg: (350+400+450)/3 = 400
    // Change: (400-150)/150 * 100 = 167%
    const data = createMockTrendData([100, 150, 200, 350, 400, 450]);
    render(<TrendChange data={data} />);
    expect(screen.getByText(/\+\d+%/)).toBeInTheDocument();
    expect(screen.getByTestId("icon-trending-up")).toBeInTheDocument();
  });

  it("shows negative percentage for declining trend", () => {
    // First 3 months avg: (400+350+300)/3 = 350
    // Last 3 months avg: (150+100+50)/3 = 100
    // Change: (100-350)/350 * 100 = -71%
    const data = createMockTrendData([400, 350, 300, 150, 100, 50]);
    render(<TrendChange data={data} />);
    expect(screen.getByText(/-\d+%/)).toBeInTheDocument();
    expect(screen.getByTestId("icon-trending-down")).toBeInTheDocument();
  });

  it("shows 0% for stable trend", () => {
    const data = createMockTrendData([100, 100, 100, 100, 100, 100]);
    render(<TrendChange data={data} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByTestId("icon-minus")).toBeInTheDocument();
  });
});
