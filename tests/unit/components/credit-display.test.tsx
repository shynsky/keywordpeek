import { describe, it, expect } from "vitest";
import { render, screen } from "../../utils";
import { CreditDisplay, LowCreditWarning } from "@/components/credit-display";

describe("CreditDisplay", () => {
  describe("credit value display", () => {
    it("formats credits with commas", () => {
      render(<CreditDisplay credits={1000} showBuyButton={false} />);
      expect(screen.getByText("1,000")).toBeInTheDocument();
    });

    it("formats large credits with commas", () => {
      render(<CreditDisplay credits={10000} showBuyButton={false} />);
      expect(screen.getByText("10,000")).toBeInTheDocument();
    });

    it("shows 0 credits", () => {
      render(<CreditDisplay credits={0} showBuyButton={false} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("low credit threshold", () => {
    it("shows warning icon at 10 credits", () => {
      render(<CreditDisplay credits={10} showBuyButton={false} />);
      expect(screen.getByTestId("icon-alert")).toBeInTheDocument();
    });

    it("shows warning icon at 5 credits", () => {
      render(<CreditDisplay credits={5} showBuyButton={false} />);
      expect(screen.getByTestId("icon-alert")).toBeInTheDocument();
    });

    it("hides warning icon at 11 credits", () => {
      render(<CreditDisplay credits={11} showBuyButton={false} />);
      expect(screen.queryByTestId("icon-alert")).not.toBeInTheDocument();
    });

    it("hides warning icon at 100 credits", () => {
      render(<CreditDisplay credits={100} showBuyButton={false} />);
      expect(screen.queryByTestId("icon-alert")).not.toBeInTheDocument();
    });
  });

  describe("zero credits state", () => {
    it("does not show warning triangle at 0 credits (shows different state)", () => {
      // At 0, the entire badge changes style - no alert triangle
      render(<CreditDisplay credits={0} showBuyButton={false} />);
      expect(screen.queryByTestId("icon-alert")).not.toBeInTheDocument();
    });
  });

  describe("variants", () => {
    describe("default variant", () => {
      it("shows credits label", () => {
        render(<CreditDisplay credits={100} showBuyButton={false} />);
        expect(screen.getByText("credits")).toBeInTheDocument();
      });

      it("shows coins icon", () => {
        render(<CreditDisplay credits={100} showBuyButton={false} />);
        expect(screen.getByTestId("icon-coins")).toBeInTheDocument();
      });
    });

    describe("compact variant", () => {
      it("shows credit value", () => {
        render(<CreditDisplay credits={100} variant="compact" showBuyButton={false} />);
        expect(screen.getByText("100")).toBeInTheDocument();
      });

      it("has title attribute", () => {
        const { container } = render(
          <CreditDisplay credits={50} variant="compact" showBuyButton={false} />
        );
        expect(container.firstChild).toHaveAttribute("title", "50 credits remaining");
      });
    });

    describe("large variant", () => {
      it("shows credits remaining text", () => {
        render(<CreditDisplay credits={100} variant="large" showBuyButton={false} />);
        expect(screen.getByText("credits remaining")).toBeInTheDocument();
      });

      it("shows credit value", () => {
        render(<CreditDisplay credits={500} variant="large" showBuyButton={false} />);
        expect(screen.getByText("500")).toBeInTheDocument();
      });
    });
  });

  describe("buy button", () => {
    it("shows buy button by default", () => {
      render(<CreditDisplay credits={100} />);
      expect(screen.getByRole("link", { name: /buy/i })).toBeInTheDocument();
    });

    it("hides buy button when showBuyButton is false", () => {
      render(<CreditDisplay credits={100} showBuyButton={false} />);
      expect(screen.queryByRole("link", { name: /buy/i })).not.toBeInTheDocument();
    });

    it("links to account page", () => {
      render(<CreditDisplay credits={100} />);
      const link = screen.getByRole("link", { name: /buy/i });
      expect(link).toHaveAttribute("href", "/account");
    });

    it("shows 'Buy More Credits' in large variant", () => {
      render(<CreditDisplay credits={100} variant="large" />);
      expect(screen.getByRole("link", { name: /buy more credits/i })).toBeInTheDocument();
    });
  });
});

describe("LowCreditWarning", () => {
  it("returns null for credits above threshold", () => {
    const { container } = render(<LowCreditWarning credits={11} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null for credits at 100", () => {
    const { container } = render(<LowCreditWarning credits={100} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows warning at threshold (10 credits)", () => {
    render(<LowCreditWarning credits={10} />);
    expect(screen.getByText("Low credits")).toBeInTheDocument();
  });

  it("shows warning below threshold", () => {
    render(<LowCreditWarning credits={5} />);
    expect(screen.getByText("Low credits")).toBeInTheDocument();
    expect(screen.getByText(/Only 5 credits left/)).toBeInTheDocument();
  });

  it("shows 'No credits remaining' at 0", () => {
    render(<LowCreditWarning credits={0} />);
    expect(screen.getByText("No credits remaining")).toBeInTheDocument();
  });

  it("shows purchase message at 0 credits", () => {
    render(<LowCreditWarning credits={0} />);
    expect(screen.getByText(/Purchase credits to continue/)).toBeInTheDocument();
  });

  it("shows buy credits button", () => {
    render(<LowCreditWarning credits={5} />);
    expect(screen.getByRole("link", { name: "Buy Credits" })).toBeInTheDocument();
  });

  it("buy credits links to account page", () => {
    render(<LowCreditWarning credits={5} />);
    const link = screen.getByRole("link", { name: "Buy Credits" });
    expect(link).toHaveAttribute("href", "/account");
  });

  it("shows alert icon", () => {
    render(<LowCreditWarning credits={5} />);
    expect(screen.getByTestId("icon-alert")).toBeInTheDocument();
  });
});
