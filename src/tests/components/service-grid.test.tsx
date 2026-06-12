import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ServiceGrid } from "@/app/tenant/[subdomain]/service-grid";
import type { Service } from "@prisma/client";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: "s1",
    tenantId: "t1",
    name: "Consultation",
    description: "A short consultation",
    category: null,
    duration: 30,
    price: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const services: Service[] = [
  makeService({ id: "s1", name: "Consultation", category: "Strategy", duration: 30 }),
  makeService({ id: "s2", name: "Workshop", category: "Training", duration: 90 }),
  makeService({ id: "s3", name: "Follow-up", category: "Strategy", duration: 15, price: 2500 }),
];

describe("ServiceGrid", () => {
  it("renders all services by default", () => {
    render(<ServiceGrid services={services} primaryColor="#10b981" />);
    expect(screen.getByText("Consultation")).toBeInTheDocument();
    expect(screen.getByText("Workshop")).toBeInTheDocument();
    expect(screen.getByText("Follow-up")).toBeInTheDocument();
  });

  it("renders category filter pills when categories exist", () => {
    render(<ServiceGrid services={services} primaryColor="#10b981" />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Strategy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Training" })).toBeInTheDocument();
  });

  it("does not render category pills when no service has a category", () => {
    const plain = [makeService({ category: null })];
    render(<ServiceGrid services={plain} primaryColor="#10b981" />);
    expect(screen.queryByRole("button", { name: "All" })).not.toBeInTheDocument();
  });

  it("filters services when a category pill is clicked", () => {
    render(<ServiceGrid services={services} primaryColor="#10b981" />);
    fireEvent.click(screen.getByRole("button", { name: "Training" }));
    expect(screen.getByText("Workshop")).toBeInTheDocument();
    expect(screen.queryByText("Consultation")).not.toBeInTheDocument();
    expect(screen.queryByText("Follow-up")).not.toBeInTheDocument();
  });

  it("shows all services again when All pill is clicked after filtering", () => {
    render(<ServiceGrid services={services} primaryColor="#10b981" />);
    fireEvent.click(screen.getByRole("button", { name: "Training" }));
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Consultation")).toBeInTheDocument();
    expect(screen.getByText("Workshop")).toBeInTheDocument();
  });

  it("displays service duration", () => {
    render(<ServiceGrid services={services} primaryColor="#10b981" />);
    expect(screen.getByText(/30 min/)).toBeInTheDocument();
    expect(screen.getByText(/90 min/)).toBeInTheDocument();
  });

  it("displays price in dollars when provided", () => {
    render(<ServiceGrid services={services} primaryColor="#10b981" />);
    expect(screen.getByText("$25.00")).toBeInTheDocument();
  });

  it("links each service card to its booking page", () => {
    render(<ServiceGrid services={services} primaryColor="#10b981" />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/book/s1");
    expect(hrefs).toContain("/book/s2");
  });
});
