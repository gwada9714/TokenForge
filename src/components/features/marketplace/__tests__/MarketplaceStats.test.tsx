import { render, screen } from "@testing-library/react";
import { MarketplaceStats } from "../components/MarketplaceStats";

describe("MarketplaceStats", () => {
  const mockStats = {
    totalItems: 100,
    totalVolume: "1000",
    activeItems: 75,
    soldItems: 25,
  };

  it("renders all stats correctly", () => {
    render(<MarketplaceStats stats={mockStats} />);

    expect(screen.getByText("Total Items")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();

    expect(screen.getByText("Volume Total")).toBeTruthy();
    expect(screen.getByText("1000")).toBeTruthy();

    expect(screen.getByText("Items Actifs")).toBeTruthy();
    expect(screen.getByText("75")).toBeTruthy();

    expect(screen.getByText("Items Vendus")).toBeTruthy();
    expect(screen.getByText("25")).toBeTruthy();
  });

  it("updates when stats change", () => {
    const { rerender } = render(<MarketplaceStats stats={mockStats} />);

    const newStats = {
      ...mockStats,
      totalItems: 150,
      activeItems: 100,
    };

    rerender(<MarketplaceStats stats={newStats} />);

    expect(screen.getByText("150")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
  });

  it("renders zero values correctly", () => {
    const zeroStats = {
      totalItems: 0,
      totalVolume: "0",
      activeItems: 0,
      soldItems: 0,
    };

    render(<MarketplaceStats stats={zeroStats} />);

    const values = screen.getAllByText("0");
    expect(values).toHaveLength(4);
  });
});
