import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AuthContext } from "~/contexts";
import type { TUser, TTour, TTravelMode } from "~/types";

// ── component mocks ──────────────────────────────────────────────────────────
// These sub-components either require data-router context, call external APIs,
// or are out of scope for tour-author role assertions.

vi.mock("~/components/TourAuthors", async () => {
  const { useContext } = await import("react");
  const { AuthContext } = await import("~/contexts");
  const MockTourAuthors = () => {
    const { currentUser, currentTenantAdmin } = useContext(AuthContext);
    if (currentUser?.super || currentTenantAdmin) {
      return <button>Manage Tour Authors</button>;
    }
    return null;
  };
  return { default: MockTourAuthors };
});

vi.mock("~/components/inputs/TextInput", () => ({
  default: ({ label, value }: { label: string; value: string }) => (
    <div>
      <label>{label}</label>
      <input defaultValue={value ?? ""} aria-label={label} />
    </div>
  ),
}));

vi.mock("~/components/inputs/SelectInput", () => ({
  default: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock("~/components/ThemeSelector", () => ({
  default: () => <div>ThemeSelector</div>,
}));

vi.mock("~/components/media_grid/MediaGrid", () => ({
  default: () => <div>MediaGrid</div>,
}));

vi.mock("~/components/stops/StopsList", () => ({
  default: () => <div>StopsList</div>,
}));

vi.mock("~/components/flat_pages/FlatPageList", () => ({
  default: () => <div>FlatPageList</div>,
}));

vi.mock("~/components/MapControls", () => ({
  default: () => <div>MapControls</div>,
}));

vi.mock("~/components/TravelModes", () => ({
  default: () => <div>TravelModes</div>,
}));

vi.mock("~/components/voice_overs/VoiceOverUpload", () => ({
  default: () => <div>VoiceOverUpload</div>,
}));

vi.mock("~/components/voice_overs/VoiceOverList", () => ({
  default: () => <div>VoiceOverList</div>,
}));

vi.mock("~/components/buttons/SaveButton", () => ({
  default: () => <button>Save</button>,
}));

vi.mock("~/components/Preview", () => ({
  default: () => <div>Preview</div>,
}));

vi.mock("~/components/Error", () => ({
  default: () => null,
}));

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: import("react").ReactNode }) => (
    <>{children}</>
  ),
}));

// ── router mocks ─────────────────────────────────────────────────────────────

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({ tourSet: "ecds", tour_id: "2" })),
  };
});

import { useLoaderData, useNavigate } from "react-router";
import TourRoute from "./tour";

// ── fixtures ──────────────────────────────────────────────────────────────────

const tourAuthorUser: TUser = {
  id: 345,
  display_name: "jay",
  email: "jay.varner@emory.edu",
  super: false,
  current_tenant_admin: false,
  terms_accepted: true,
  access_requests: [],
  date_joined: "Aug 28, 2026",
  last_sign_in: "Sep 08, 2026",
  tour_sets: [],
  tours: [
    {
      tour_set: { id: 24, name: "ECDS", subdir: "ecds" },
      tours: [{ id: 2, title: "Erich's Awesome Test" }],
    },
  ],
} as unknown as TUser;

const baseTour: TTour = {
  id: 2,
  title: "Erich's Awesome Test",
  description: "<p>A test tour</p>",
  published: false,
  published_on: null,
  meta_description: "short description",
  default_lng: "en-US",
  is_geo: true,
  use_directions: false,
  restrict_bounds: false,
  link_text: null,
  link_address: "",
  media: [],
  stops: [],
  flat_pages: [],
  voice_overs: [],
  theme: { id: 1, title: "Default" },
} as unknown as TTour;

const modes: TTravelMode[] = [];

const okResponse = { status: 200, ok: true } as unknown as Response;
const unauthorizedResponse = { status: 401, ok: false } as unknown as Response;
const notFoundResponse = { status: 404, ok: false } as unknown as Response;

// ── helpers ───────────────────────────────────────────────────────────────────

const authContextValue = (user: TUser | undefined, tenantAdmin = false) => ({
  signedIn: true,
  currentUser: user,
  setCurrentUser: vi.fn(),
  currentTenantAdmin: tenantAdmin,
  setCurrentTenantAdmin: vi.fn(),
});

const renderTour = (
  tour: TTour | Partial<TTour>,
  response: Response = okResponse,
  user: TUser = tourAuthorUser,
) => {
  vi.mocked(useLoaderData).mockReturnValue({ tour, modes, response });

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authContextValue(user)}>
        <TourRoute />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe("TourRoute — tour author (no tour_sets, super: false)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the tour title field with the tour's title", () => {
    renderTour(baseTour);
    expect(screen.getByRole("textbox", { name: "Tour Title" })).toHaveValue(
      "Erich's Awesome Test",
    );
  });

  it("renders the Published select", () => {
    renderTour(baseTour);
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("renders the Description field", () => {
    renderTour(baseTour);
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("does not show the Manage Tour Authors button", () => {
    renderTour(baseTour);
    expect(
      screen.queryByRole("button", { name: /Manage Tour Authors/i }),
    ).not.toBeInTheDocument();
  });

  it("shows a Save button", () => {
    renderTour(baseTour);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("redirects to /signin on a 401 response", () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);
    renderTour({} as TTour, unauthorizedResponse);
    expect(navigate).toHaveBeenCalledWith("/signin");
  });

  it("shows a not-found message on a 404 response", () => {
    renderTour({} as TTour, notFoundResponse);
    expect(
      screen.getByText("This tour could not be found."),
    ).toBeInTheDocument();
  });

  it("shows a Back to tours link on 404 that points to the tour set", () => {
    renderTour({} as TTour, notFoundResponse);
    const link = screen.getByRole("link", { name: /back to tours/i });
    expect(link).toHaveAttribute("href", "/admin/ecds");
  });
});

describe("TourRoute — super user / tenant admin sees Manage Tour Authors", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the Manage Tour Authors button for a super user", () => {
    const superUser = { ...tourAuthorUser, super: true } as TUser;
    vi.mocked(useLoaderData).mockReturnValue({
      tour: baseTour,
      modes,
      response: okResponse,
    });
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authContextValue(superUser)}>
          <TourRoute />
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("button", { name: /Manage Tour Authors/i }),
    ).toBeInTheDocument();
  });

  it("shows the Manage Tour Authors button for a tenant admin", () => {
    vi.mocked(useLoaderData).mockReturnValue({
      tour: baseTour,
      modes,
      response: okResponse,
    });
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authContextValue(tourAuthorUser, true)}>
          <TourRoute />
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("button", { name: /Manage Tour Authors/i }),
    ).toBeInTheDocument();
  });
});
