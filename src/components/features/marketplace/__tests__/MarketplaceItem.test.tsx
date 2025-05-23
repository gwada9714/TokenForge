import { render, screen } from "@testing-library/react";
import { MarketplaceItem } from "../components/MarketplaceItem";

describe("MarketplaceItem", () => {
  const mockItem = {
    id: "1",
    name: "Test Token",
    description: "Test Description",
    price: "100",
    seller: "0x123",
    tokenAddress: "0x456",
    tokenSymbol: "TEST",
    tokenDecimals: 18,
    status: "active" as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it("renders item details correctly", () => {
    render(<MarketplaceItem item={mockItem} />);

    expect(screen.getByText(mockItem.name)).toBeTruthy();
    expect(screen.getByText(mockItem.description)).toBeTruthy();
    expect(
      screen.getByText(`${mockItem.price} ${mockItem.tokenSymbol}`)
    ).toBeTruthy();
    expect(screen.getByText(`Vendeur: ${mockItem.seller}`)).toBeTruthy();
  });

  it("renders active status chip correctly", () => {
    render(<MarketplaceItem item={mockItem} />);
    const chip = screen.getByTestId("status-chip");
    expect(chip).toHaveClass("MuiChip-filled");
    expect(chip).toHaveClass("MuiChip-colorSuccess");
  });

  it("renders sold status chip correctly", () => {
    const soldItem = { ...mockItem, status: "sold" as const };
    render(<MarketplaceItem item={soldItem} />);
    const chip = screen.getByTestId("status-chip");
    expect(chip).toHaveClass("MuiChip-filled");
    expect(chip).toHaveClass("MuiChip-colorError");
  });

  it("renders cancelled status chip correctly", () => {
    const cancelledItem = { ...mockItem, status: "cancelled" as const };
    render(<MarketplaceItem item={cancelledItem} />);
    const chip = screen.getByTestId("status-chip");
    expect(chip).toHaveClass("MuiChip-filled");
    expect(chip).toHaveClass("MuiChip-colorDefault");
  });

  it("disables buy button for non-active items", () => {
    const soldItem = { ...mockItem, status: "sold" as const };
    render(<MarketplaceItem item={soldItem} />);
    expect(screen.getByText("Acheter")).toBeDisabled();
  });

  it("enables buy button for active items", () => {
    render(<MarketplaceItem item={mockItem} />);
    expect(screen.getByText("Acheter")).not.toBeDisabled();
  });
});
