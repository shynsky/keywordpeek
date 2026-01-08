import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../../utils";
import { KeywordTable, KeywordTableSkeleton, KeywordList } from "@/components/keyword-table";
import { createMockKeyword } from "../../utils";

// Test formatVolume function behavior through the component
describe("KeywordTable", () => {
  describe("volume formatting", () => {
    it("formats 500 as '500'", () => {
      const keywords = [createMockKeyword({ keyword: "test", searchVolume: 500 })];
      render(<KeywordTable keywords={keywords} />);
      expect(screen.getByText("500")).toBeInTheDocument();
    });

    it("formats 1500 as '1.5K'", () => {
      const keywords = [createMockKeyword({ keyword: "test", searchVolume: 1500 })];
      render(<KeywordTable keywords={keywords} />);
      expect(screen.getByText("1.5K")).toBeInTheDocument();
    });

    it("formats 15000 as '15.0K'", () => {
      const keywords = [createMockKeyword({ keyword: "test", searchVolume: 15000 })];
      render(<KeywordTable keywords={keywords} />);
      expect(screen.getByText("15.0K")).toBeInTheDocument();
    });

    it("formats 1500000 as '1.5M'", () => {
      const keywords = [createMockKeyword({ keyword: "test", searchVolume: 1500000 })];
      render(<KeywordTable keywords={keywords} />);
      expect(screen.getByText("1.5M")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty message when no keywords", () => {
      render(<KeywordTable keywords={[]} />);
      expect(screen.getByText("No keywords yet")).toBeInTheDocument();
    });

    it("shows helpful message in empty state", () => {
      render(<KeywordTable keywords={[]} />);
      expect(screen.getByText(/Enter a keyword above/)).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows skeleton when isLoading is true", () => {
      const { container } = render(<KeywordTable keywords={[]} isLoading />);
      const skeletonRows = container.querySelectorAll(".animate-pulse");
      expect(skeletonRows.length).toBeGreaterThan(0);
    });
  });

  describe("sorting", () => {
    const keywords = [
      createMockKeyword({ keyword: "alpha", searchVolume: 1000, keywordScore: 80 }),
      createMockKeyword({ keyword: "beta", searchVolume: 5000, keywordScore: 60 }),
      createMockKeyword({ keyword: "gamma", searchVolume: 2000, keywordScore: 70 }),
    ];

    it("sorts by keywordScore descending by default", () => {
      render(<KeywordTable keywords={keywords} />);
      const rows = screen.getAllByRole("row");
      // First row is header, data starts at index 1
      // Score 80 should be first
      expect(rows[1]).toHaveTextContent("alpha");
    });

    it("toggles sort direction when clicking same column", () => {
      render(<KeywordTable keywords={keywords} />);

      // Click on Score header to toggle direction
      const scoreHeader = screen.getByRole("button", { name: /score/i });
      fireEvent.click(scoreHeader);

      // Now should be ascending (60 first)
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("beta"); // Score 60
    });

    it("sorts by volume when volume header clicked", () => {
      render(<KeywordTable keywords={keywords} />);

      const volumeHeader = screen.getByRole("button", { name: /volume/i });
      fireEvent.click(volumeHeader);

      // Should be descending (5000 first)
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("beta"); // Volume 5000
    });

    it("sorts by keyword alphabetically", () => {
      render(<KeywordTable keywords={keywords} />);

      const keywordHeader = screen.getByRole("button", { name: /keyword/i });
      fireEvent.click(keywordHeader);

      // Descending alphabetically
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("gamma");
    });
  });

  describe("row interaction", () => {
    it("calls onKeywordClick when row is clicked", () => {
      const onKeywordClick = vi.fn();
      const keywords = [createMockKeyword({ keyword: "test keyword" })];

      render(<KeywordTable keywords={keywords} onKeywordClick={onKeywordClick} />);

      const row = screen.getByRole("row", { name: /test keyword/i });
      fireEvent.click(row);

      expect(onKeywordClick).toHaveBeenCalledWith("test keyword");
    });

    it("has cursor-pointer class when onKeywordClick is provided", () => {
      const keywords = [createMockKeyword({ keyword: "test" })];
      render(<KeywordTable keywords={keywords} onKeywordClick={vi.fn()} />);

      const row = screen.getByRole("row", { name: /test/i });
      expect(row).toHaveClass("cursor-pointer");
    });
  });

  describe("actions menu", () => {
    it("renders dropdown trigger button", () => {
      const keyword = createMockKeyword({ keyword: "test keyword" });
      render(<KeywordTable keywords={[keyword]} onSaveKeyword={vi.fn()} />);

      // The more button should be present (even if opacity is 0 until hover)
      const buttons = screen.getAllByRole("button");
      const dropdownTrigger = buttons.find(
        (btn) => btn.getAttribute("aria-haspopup") === "menu"
      );
      expect(dropdownTrigger).toBeDefined();
    });
  });

  describe("CPC display", () => {
    it("formats CPC with 2 decimal places", () => {
      const keywords = [createMockKeyword({ keyword: "test", cpc: 1.5 })];
      render(<KeywordTable keywords={keywords} />);
      expect(screen.getByText("$1.50")).toBeInTheDocument();
    });
  });

  describe("table headers", () => {
    it("renders all column headers", () => {
      render(<KeywordTable keywords={[createMockKeyword()]} />);

      expect(screen.getByText("Keyword")).toBeInTheDocument();
      expect(screen.getByText("Score")).toBeInTheDocument();
      expect(screen.getByText("Volume")).toBeInTheDocument();
      expect(screen.getByText("Difficulty")).toBeInTheDocument();
      expect(screen.getByText("Competition")).toBeInTheDocument();
      expect(screen.getByText("CPC")).toBeInTheDocument();
      expect(screen.getByText("Trend")).toBeInTheDocument();
    });
  });
});

describe("KeywordTableSkeleton", () => {
  it("renders skeleton rows", () => {
    const { container } = render(<KeywordTableSkeleton />);
    const skeletonCells = container.querySelectorAll(".animate-pulse");
    expect(skeletonCells.length).toBeGreaterThan(0);
  });

  it("renders 5 skeleton rows", () => {
    render(<KeywordTableSkeleton />);
    const rows = screen.getAllByRole("row");
    // 1 header row + 5 skeleton rows
    expect(rows).toHaveLength(6);
  });
});

describe("KeywordList", () => {
  it("renders keywords in compact format", () => {
    const keywords = [
      createMockKeyword({ keyword: "keyword one" }),
      createMockKeyword({ keyword: "keyword two" }),
    ];
    render(<KeywordList keywords={keywords} />);

    expect(screen.getByText("keyword one")).toBeInTheDocument();
    expect(screen.getByText("keyword two")).toBeInTheDocument();
  });

  it("calls onKeywordClick when clicked", () => {
    const onKeywordClick = vi.fn();
    const keywords = [createMockKeyword({ keyword: "test" })];

    render(<KeywordList keywords={keywords} onKeywordClick={onKeywordClick} />);

    fireEvent.click(screen.getByText("test"));
    expect(onKeywordClick).toHaveBeenCalledWith("test");
  });
});
