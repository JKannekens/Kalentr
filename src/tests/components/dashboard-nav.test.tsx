import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// usePathname is called at render time — set up mock value before importing component
const mockUsePathname = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => <a href={href} className={className}>{children}</a>,
}));

// Import after mocks are registered
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

describe("DashboardNav", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/dashboard");
  });

  it("renders all five nav links", () => {
    render(<DashboardNav />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Appointments")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("links point to the correct paths", () => {
    render(<DashboardNav />);
    expect(screen.getByRole("link", { name: /overview/i })).toHaveAttribute(
      "href",
      "/dashboard"
    );
    expect(screen.getByRole("link", { name: /appointments/i })).toHaveAttribute(
      "href",
      "/dashboard/appointments"
    );
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute(
      "href",
      "/dashboard/settings"
    );
  });

  it("applies active style to the current route", () => {
    mockUsePathname.mockReturnValue("/dashboard/appointments");
    render(<DashboardNav />);
    const appointmentsLink = screen.getByRole("link", { name: /appointments/i });
    expect(appointmentsLink.className).toContain("text-primary");
  });

  it("does not apply active style to inactive routes", () => {
    mockUsePathname.mockReturnValue("/dashboard/appointments");
    render(<DashboardNav />);
    const overviewLink = screen.getByRole("link", { name: /overview/i });
    expect(overviewLink.className).not.toContain("text-primary");
  });

  it("returns nothing on the onboarding page", () => {
    mockUsePathname.mockReturnValue("/onboarding");
    const { container } = render(<DashboardNav />);
    expect(container.firstChild).toBeNull();
  });
});
