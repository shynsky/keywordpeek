import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../../utils";
import { CsvExportButton, CopyKeywordsButton } from "@/components/csv-export-button";
import { createMockKeyword } from "../../utils";

describe("CsvExportButton", () => {
  describe("disabled state", () => {
    it("is disabled when keywords array is empty", () => {
      render(<CsvExportButton keywords={[]} />);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("shows export text when disabled", () => {
      render(<CsvExportButton keywords={[]} />);
      expect(screen.getByText("Export")).toBeInTheDocument();
    });
  });

  describe("enabled state", () => {
    it("is enabled when keywords exist", () => {
      render(<CsvExportButton keywords={[createMockKeyword()]} />);
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    it("shows keyword count in parentheses", () => {
      render(<CsvExportButton keywords={[createMockKeyword(), createMockKeyword()]} />);
      expect(screen.getByText("(2)")).toBeInTheDocument();
    });

    it("shows singular count for one keyword", () => {
      render(<CsvExportButton keywords={[createMockKeyword()]} />);
      expect(screen.getByText("(1)")).toBeInTheDocument();
    });
  });

  describe("default variant", () => {
    it("shows Export CSV text", () => {
      const keywords = [createMockKeyword()];
      render(<CsvExportButton keywords={keywords} />);
      expect(screen.getByText("Export CSV")).toBeInTheDocument();
    });

    it("is a single button (not dropdown)", () => {
      const keywords = [createMockKeyword()];
      render(<CsvExportButton keywords={keywords} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
    });
  });

  describe("dropdown variant", () => {
    it("renders as dropdown trigger", () => {
      const keywords = [createMockKeyword()];
      render(<CsvExportButton keywords={keywords} variant="dropdown" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-haspopup", "menu");
    });

    it("shows Export text (not Export CSV)", () => {
      const keywords = [createMockKeyword()];
      render(<CsvExportButton keywords={keywords} variant="dropdown" />);
      // In dropdown variant, button just says "Export"
      expect(screen.getByText("Export")).toBeInTheDocument();
    });
  });

  describe("custom filename", () => {
    it("accepts filename prop without error", () => {
      const keywords = [createMockKeyword()];
      // Just verify it renders without error
      const { container } = render(
        <CsvExportButton keywords={keywords} filename="my-keywords" />
      );
      expect(container.querySelector("button")).toBeInTheDocument();
    });
  });

  describe("custom className", () => {
    it("applies custom className", () => {
      const keywords = [createMockKeyword()];
      render(<CsvExportButton keywords={keywords} className="custom-class" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });
});

describe("CopyKeywordsButton", () => {
  it("is disabled when keywords array is empty", () => {
    render(<CopyKeywordsButton keywords={[]} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is enabled when keywords exist", () => {
    render(<CopyKeywordsButton keywords={["test"]} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("shows correct count text for single keyword", () => {
    render(<CopyKeywordsButton keywords={["test"]} />);
    expect(screen.getByText("Copy 1 keyword")).toBeInTheDocument();
  });

  it("shows correct count text for multiple keywords", () => {
    render(<CopyKeywordsButton keywords={["test1", "test2", "test3"]} />);
    expect(screen.getByText("Copy 3 keywords")).toBeInTheDocument();
  });

  it("copies keywords to clipboard on click", async () => {
    const keywords = ["keyword1", "keyword2"];
    render(<CopyKeywordsButton keywords={keywords} />);

    fireEvent.click(screen.getByRole("button"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("keyword1\nkeyword2");
  });

  it("does not copy when empty and button clicked", () => {
    // Clear mock calls
    vi.mocked(navigator.clipboard.writeText).mockClear();

    render(<CopyKeywordsButton keywords={[]} />);
    const button = screen.getByRole("button");

    // Button is disabled, so click won't trigger handler
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<CopyKeywordsButton keywords={["test"]} className="custom-class" />);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});
