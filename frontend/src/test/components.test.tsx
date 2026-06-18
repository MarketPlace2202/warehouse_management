import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/StatCard";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Total Products" value={42} icon="📦" color="blue" />);
    expect(screen.getByText("Total Products")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});

describe("PageHeader", () => {
  it("renders title and description", async () => {
    const { PageHeader } = await import("@/components/PageHeader");
    render(<PageHeader title="Dashboard" description="Overview" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });
});
