import React from "react";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import { vi } from "vitest";
import { ThemeProvider } from "@mui/material/styles";
import { AuditLogList } from "@/components/features/admin/audit/AuditLogList";
import { theme } from "@/styles/theme";
import type { AuditLog } from "@/types/contracts";
import userEvent from "@testing-library/user-event";

const generateMockLogs = (count: number): AuditLog[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    message: `Test action ${i + 1}`,
    level: i % 3 === 0 ? "info" : i % 3 === 1 ? "warning" : "error",
    timestamp: new Date(`2024-02-23T${10 + i}:00:00`).getTime(),
    category: i % 2 === 0 ? "user" : "payment",
    action: i % 2 === 0 ? "login" : "process",
    metadata: i % 2 === 0 ? { ip: `192.168.1.${i}` } : { amount: `${i}.5 ETH` },
  }));
};

const mockLogs = generateMockLogs(3);

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("AuditLogList", () => {
  const mockOnViewDetails = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Affichage des Logs", () => {
    it("devrait afficher correctement les logs", () => {
      renderWithTheme(
        <AuditLogList
          logs={mockLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      mockLogs.forEach((log) => {
        expect(screen.getByText(log.message)).toBeInTheDocument();
        expect(screen.getByText(log.category)).toBeInTheDocument();
        expect(screen.getByText(log.level)).toBeInTheDocument();
        expect(
          screen.getByText(new Date(log.timestamp).toLocaleString())
        ).toBeInTheDocument();
      });
    });

    it("devrait afficher un message quand il n'y a pas de logs", () => {
      renderWithTheme(
        <AuditLogList
          logs={[]}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByText("Aucun log d'audit disponible")
      ).toBeInTheDocument();
    });

    it("devrait afficher le skeleton loader pendant le chargement", () => {
      renderWithTheme(
        <AuditLogList
          logs={mockLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const skeletons = screen.getAllByTestId("skeleton");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Tri et Filtrage", () => {
    const manyLogs = generateMockLogs(20);

    it("devrait trier les logs par date", async () => {
      renderWithTheme(
        <AuditLogList
          logs={manyLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
          defaultSort="date"
        />
      );

      const timestamps = screen
        .getAllByTestId("log-timestamp")
        .map((el) => el.textContent)
        .map((text) => new Date(text || "").getTime());

      expect([...timestamps]).toEqual(timestamps.sort((a, b) => b - a));
    });

    it("devrait trier les logs par niveau de gravité", async () => {
      renderWithTheme(
        <AuditLogList
          logs={manyLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
          defaultSort="level"
        />
      );

      const levels = screen
        .getAllByTestId("log-level")
        .map((el) => el.textContent);

      const severityOrder = { error: 0, warning: 1, info: 2 };
      const isSorted = levels.every(
        (level, i) =>
          i === 0 ||
          severityOrder[level as keyof typeof severityOrder] >=
            severityOrder[levels[i - 1] as keyof typeof severityOrder]
      );

      expect(isSorted).toBe(true);
    });

    it("devrait filtrer les logs par niveau", async () => {
      renderWithTheme(
        <AuditLogList
          logs={manyLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      const filterSelect = screen.getByLabelText("Filtrer par niveau");
      await userEvent.selectOptions(filterSelect, "error");

      const visibleLogs = screen.getAllByRole("listitem");
      visibleLogs.forEach((log) => {
        expect(within(log).getByTestId("error-icon")).toBeInTheDocument();
      });
    });

    it("devrait filtrer les logs par catégorie", async () => {
      renderWithTheme(
        <AuditLogList
          logs={manyLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      const filterSelect = screen.getByLabelText("Filtrer par catégorie");
      await userEvent.selectOptions(filterSelect, "payment");

      const visibleLogs = screen.getAllByRole("listitem");
      visibleLogs.forEach((log) => {
        expect(within(log).getByText("payment")).toBeInTheDocument();
      });
    });
  });

  describe("Pagination", () => {
    const manyLogs = generateMockLogs(25);

    it("devrait gérer la pagination correctement", async () => {
      renderWithTheme(
        <AuditLogList
          logs={manyLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
          itemsPerPage={10}
        />
      );

      // Vérifier la première page
      expect(screen.getAllByRole("listitem")).toHaveLength(10);
      expect(screen.getByText("Test action 1")).toBeInTheDocument();

      // Aller à la page suivante
      const nextButton = screen.getByRole("button", { name: /suivant/i });
      await userEvent.click(nextButton);

      // Vérifier la deuxième page
      expect(screen.getByText("Test action 11")).toBeInTheDocument();

      // Vérifier les informations de pagination
      expect(screen.getByText("11-20 sur 25")).toBeInTheDocument();
    });

    it("devrait désactiver les boutons de pagination appropriés", () => {
      renderWithTheme(
        <AuditLogList
          logs={manyLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
          itemsPerPage={10}
        />
      );

      const prevButton = screen.getByRole("button", { name: /précédent/i });
      expect(prevButton).toBeDisabled();

      const nextButton = screen.getByRole("button", { name: /suivant/i });
      expect(nextButton).not.toBeDisabled();
    });

    it("devrait permettre de changer le nombre d'éléments par page", async () => {
      renderWithTheme(
        <AuditLogList
          logs={manyLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
          itemsPerPage={10}
        />
      );

      const pageSizeSelect = screen.getByLabelText("Éléments par page");
      await userEvent.selectOptions(pageSizeSelect, "20");

      expect(screen.getAllByRole("listitem")).toHaveLength(20);
    });
  });

  describe("Actions sur les Logs", () => {
    it("devrait appeler onDelete avec l'ID correct", () => {
      renderWithTheme(
        <AuditLogList
          logs={mockLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByTestId(/delete-button-/);
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockLogs[0].id);
    });

    it("devrait afficher une confirmation avant la suppression", async () => {
      renderWithTheme(
        <AuditLogList
          logs={mockLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
          confirmDelete={true}
        />
      );

      const deleteButton = screen.getAllByTestId(/delete-button-/)[0];
      await userEvent.click(deleteButton);

      expect(screen.getByText("Confirmer la suppression")).toBeInTheDocument();

      const confirmButton = screen.getByRole("button", { name: /confirmer/i });
      await userEvent.click(confirmButton);

      expect(mockOnDelete).toHaveBeenCalledWith(mockLogs[0].id);
    });

    it("devrait appeler onViewDetails avec le log correct", () => {
      renderWithTheme(
        <AuditLogList
          logs={mockLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      const firstLogContainer = screen
        .getByText(mockLogs[0].message)
        .closest("li");
      if (!firstLogContainer) throw new Error("Log container not found");

      const viewButton = within(firstLogContainer).getByRole("button", {
        name: /voir les détails/i,
      });
      fireEvent.click(viewButton);

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockLogs[0]);
    });
  });

  describe("Accessibilité", () => {
    it("devrait avoir les attributs ARIA appropriés", () => {
      renderWithTheme(
        <AuditLogList
          logs={mockLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole("list")).toHaveAttribute(
        "aria-label",
        "audit logs"
      );

      const deleteButtons = screen.getAllByTestId(/delete-button-/);
      deleteButtons.forEach((button, index) => {
        expect(button).toHaveAttribute(
          "aria-label",
          `delete log ${mockLogs[index].action}`
        );
      });
    });

    it("devrait être navigable au clavier", async () => {
      renderWithTheme(
        <AuditLogList
          logs={mockLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      const firstViewButton = screen.getAllByRole("button", {
        name: /voir les détails/i,
      })[0];
      firstViewButton.focus();
      expect(document.activeElement).toBe(firstViewButton);

      await userEvent.keyboard("{Tab}");
      const firstDeleteButton = screen.getAllByTestId(/delete-button-/)[0];
      expect(document.activeElement).toBe(firstDeleteButton);
    });
  });

  describe("Performance", () => {
    it("devrait gérer efficacement un grand nombre de logs", () => {
      const manyLogs = generateMockLogs(1000);
      const startTime = performance.now();

      renderWithTheme(
        <AuditLogList
          logs={manyLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
          virtualScroll={true}
        />
      );

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Max 100ms pour le rendu initial
    });

    it("devrait optimiser les re-rendus", async () => {
      const { rerender } = renderWithTheme(
        <AuditLogList
          logs={mockLogs}
          onViewDetails={mockOnViewDetails}
          onDelete={mockOnDelete}
        />
      );

      const renderCount = { value: 0 };
      vi.spyOn(console, "log").mockImplementation(() => {
        renderCount.value++;
      });

      // Re-render avec les mêmes props
      rerender(
        <ThemeProvider theme={theme}>
          <AuditLogList
            logs={mockLogs}
            onViewDetails={mockOnViewDetails}
            onDelete={mockOnDelete}
          />
        </ThemeProvider>
      );

      expect(renderCount.value).toBe(0); // Pas de re-rendu inutile
    });
  });
});
