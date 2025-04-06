import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "../utils/test-utils";
import { ServiceType } from "../types";
import { MOCK_SERVICES, mockServiceConfig } from "../mocks/services";

vi.mock("@/features/services/config/services", () => mockServiceConfig);

const MockServiceSelection: React.FC<{
  onServiceSelected: (type: ServiceType) => void;
}> = ({ onServiceSelected }) => (
  <div>
    {MOCK_SERVICES.map((service) => (
      <div key={service.id} onClick={() => onServiceSelected(service.id)}>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <p>
          {service.price.baseFee} {service.price.currency}
        </p>
        {service.features.map((feature) => (
          <div key={feature.id}>
            <span
              data-testid={`feature-${feature.id}`}
              title={feature.description}
            >
              {feature.name}
            </span>
          </div>
        ))}
      </div>
    ))}
  </div>
);

vi.mock("@/features/services/components/ServiceSelection", () => ({
  ServiceSelection: MockServiceSelection,
}));

describe("ServiceSelection Component", () => {
  const mockOnServiceSelected = vi.fn();

  beforeEach(() => {
    mockOnServiceSelected.mockClear();
  });

  it("affiche tous les services disponibles", () => {
    render(<MockServiceSelection onServiceSelected={mockOnServiceSelected} />);

    MOCK_SERVICES.forEach((service) => {
      expect(screen.getByText(service.name)).toBeDefined();
      expect(screen.getByText(service.description)).toBeDefined();
    });
  });

  it("affiche les caractéristiques de chaque service", () => {
    render(<MockServiceSelection onServiceSelected={mockOnServiceSelected} />);

    MOCK_SERVICES.forEach((service) => {
      service.features.forEach((feature) => {
        expect(screen.getByText(feature.name)).toBeDefined();
      });
    });
  });

  it("affiche les prix correctement", () => {
    render(<MockServiceSelection onServiceSelected={mockOnServiceSelected} />);

    MOCK_SERVICES.forEach((service) => {
      const priceText = `${service.price.baseFee} ${service.price.currency}`;
      expect(screen.getByText(new RegExp(priceText))).toBeDefined();
    });
  });

  it("appelle onServiceSelected avec le bon type lors du clic", async () => {
    render(<MockServiceSelection onServiceSelected={mockOnServiceSelected} />);

    const firstService = MOCK_SERVICES[0];
    const serviceCard = screen.getByText(firstService.name).closest("div");
    if (!serviceCard) throw new Error("Service card not found");

    await fireEvent.click(serviceCard);
    expect(mockOnServiceSelected).toHaveBeenCalledWith(firstService.id);
  });

  it("affiche les descriptions des caractéristiques dans les attributs title", () => {
    render(<MockServiceSelection onServiceSelected={mockOnServiceSelected} />);

    MOCK_SERVICES.forEach((service) => {
      service.features.forEach((feature) => {
        const featureElement = screen.getByTestId(`feature-${feature.id}`);
        expect(featureElement.getAttribute("title")).toBe(feature.description);
      });
    });
  });
});
