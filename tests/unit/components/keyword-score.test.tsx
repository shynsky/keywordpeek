import { describe, it, expect } from "vitest";
import { render, screen } from "../../utils";
import { KeywordScore, KeywordScoreCircle } from "@/components/keyword-score";

describe("KeywordScore", () => {
  describe("score categorization", () => {
    it("renders Great for score >= 70", () => {
      render(<KeywordScore score={75} showLabel />);
      expect(screen.getByText("75")).toBeInTheDocument();
      expect(screen.getByText("Great")).toBeInTheDocument();
    });

    it("renders Great for score exactly 70", () => {
      render(<KeywordScore score={70} showLabel />);
      expect(screen.getByText("70")).toBeInTheDocument();
      expect(screen.getByText("Great")).toBeInTheDocument();
    });

    it("renders Good for score 50-69", () => {
      render(<KeywordScore score={55} showLabel />);
      expect(screen.getByText("55")).toBeInTheDocument();
      expect(screen.getByText("Good")).toBeInTheDocument();
    });

    it("renders Good for score exactly 50", () => {
      render(<KeywordScore score={50} showLabel />);
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("Good")).toBeInTheDocument();
    });

    it("renders Fair for score 30-49", () => {
      render(<KeywordScore score={40} showLabel />);
      expect(screen.getByText("40")).toBeInTheDocument();
      expect(screen.getByText("Fair")).toBeInTheDocument();
    });

    it("renders Fair for score exactly 30", () => {
      render(<KeywordScore score={30} showLabel />);
      expect(screen.getByText("30")).toBeInTheDocument();
      expect(screen.getByText("Fair")).toBeInTheDocument();
    });

    it("renders Low for score < 30", () => {
      render(<KeywordScore score={20} showLabel />);
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("Low")).toBeInTheDocument();
    });

    it("renders Low for score 0", () => {
      render(<KeywordScore score={0} showLabel />);
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("Low")).toBeInTheDocument();
    });
  });

  describe("showLabel prop", () => {
    it("hides label when showLabel is false", () => {
      render(<KeywordScore score={75} showLabel={false} />);
      expect(screen.getByText("75")).toBeInTheDocument();
      expect(screen.queryByText("Great")).not.toBeInTheDocument();
    });

    it("hides label by default", () => {
      render(<KeywordScore score={75} />);
      expect(screen.getByText("75")).toBeInTheDocument();
      expect(screen.queryByText("Great")).not.toBeInTheDocument();
    });
  });

  describe("size prop", () => {
    it("applies sm size classes", () => {
      const { container } = render(<KeywordScore score={50} size="sm" />);
      expect(container.firstChild).toHaveClass("text-xs");
    });

    it("applies md size classes by default", () => {
      const { container } = render(<KeywordScore score={50} />);
      expect(container.firstChild).toHaveClass("text-sm");
    });

    it("applies lg size classes", () => {
      const { container } = render(<KeywordScore score={50} size="lg" />);
      expect(container.firstChild).toHaveClass("text-base");
    });
  });

  describe("title attribute", () => {
    it("has correct title for Great score", () => {
      const { container } = render(<KeywordScore score={80} />);
      expect(container.firstChild).toHaveAttribute("title", "Keyword Score: 80/100 (Great)");
    });

    it("has correct title for Low score", () => {
      const { container } = render(<KeywordScore score={15} />);
      expect(container.firstChild).toHaveAttribute("title", "Keyword Score: 15/100 (Low)");
    });
  });
});

describe("KeywordScoreCircle", () => {
  it("renders SVG elements", () => {
    const { container } = render(<KeywordScoreCircle score={50} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(2); // Background and progress circles
  });

  it("displays score value", () => {
    render(<KeywordScoreCircle score={65} />);
    expect(screen.getByText("65")).toBeInTheDocument();
  });

  it("applies custom size", () => {
    const { container } = render(<KeywordScoreCircle score={50} size={64} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe("64px");
    expect(wrapper.style.height).toBe("64px");
  });

  it("renders circles with correct radius", () => {
    const size = 48;
    const strokeWidth = 4;
    const expectedRadius = (size - strokeWidth) / 2;

    const { container } = render(<KeywordScoreCircle score={50} size={size} strokeWidth={strokeWidth} />);
    const circles = container.querySelectorAll("circle");

    expect(circles.length).toBe(2);
    circles.forEach((circle) => {
      expect(circle.getAttribute("r")).toBe(expectedRadius.toString());
    });
  });
});
