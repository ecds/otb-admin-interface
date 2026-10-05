import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AuthContext } from "~/contexts";
import type { TUser, TTour, TTravelMode } from "~/types";

// ── component mocks ──────────────────────────────────────────────────────────

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

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: import("react").ReactNode }) => (
    <>{children}</>
  ),
}));

// ── data / store mocks ───────────────────────────────────────────────────────

vi.mock("~/hooks/useTourQuery");
vi.mock("~/store/tourStore");

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useParams: vi.fn(() => ({ tourSet: "ecds", tour_id: "2" })),
  };
});

import { useTourQuery } from "~/hooks/useTourQuery";
import { useTourStore } from "~/store/tourStore";
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

// ── helpers ───────────────────────────────────────────────────────────────────

const setupSuccess = (tour: TTour = baseTour) => {
  vi.mocked(useTourQuery).mockReturnValue({
    data: { tour, modes },
    status: "success",
  } as ReturnType<typeof useTourQuery>);
  vi.mocked(useTourStore).mockReturnValue(tour);
};

const setupPending = () => {
  vi.mocked(useTourQuery).mockReturnValue({
    data: undefined,
    status: "pending",
  } as unknown as ReturnType<typeof useTourQuery>);
  vi.mocked(useTourStore).mockReturnValue(null);
};

const setupError = () => {
  vi.mocked(useTourQuery).mockReturnValue({
    data: undefined,
    status: "error",
  } as unknown as ReturnType<typeof useTourQuery>);
  vi.mocked(useTourStore).mockReturnValue(null);
};

const authCtx = (user: TUser | undefined, tenantAdmin = false) => ({
  signedIn: true,
  currentUser: user,
  setCurrentUser: vi.fn(),
  currentTenantAdmin: tenantAdmin,
  setCurrentTenantAdmin: vi.fn(),
});

const renderTour = (user: TUser = tourAuthorUser) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={authCtx(user)}>
        <TourRoute />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

// ── tests ─────────────────────────────────────────────────────────────────────

describe("TourRoute — loading state", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a loading indicator while the query is pending", () => {
    setupPending();
    renderTour();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

describe("TourRoute — error / not found state", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a not-found message when the query errors", () => {
    setupError();
    renderTour();
    expect(
      screen.getByText("This tour could not be found."),
    ).toBeInTheDocument();
  });

  it("shows a Back to tours link pointing to the tour set", () => {
    setupError();
    renderTour();
    expect(
      screen.getByRole("link", { name: /back to tours/i }),
    ).toHaveAttribute("href", "/admin/ecds");
  });
});

describe("TourRoute — tour author (super: false, not tenant admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccess();
  });

  it("renders the tour title field with the tour's title", () => {
    renderTour();
    expect(screen.getByRole("textbox", { name: "Tour Title" })).toHaveValue(
      "Erich's Awesome Test",
    );
  });

  it("renders the Published select", () => {
    renderTour();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("renders the Description field", () => {
    renderTour();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("does not show the Manage Tour Authors button", () => {
    renderTour();
    expect(
      screen.queryByRole("button", { name: /Manage Tour Authors/i }),
    ).not.toBeInTheDocument();
  });

  it("shows a Save button", () => {
    renderTour();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});

describe("TourRoute — super user / tenant admin sees Manage Tour Authors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccess();
  });

  it("shows the Manage Tour Authors button for a super user", () => {
    const superUser = { ...tourAuthorUser, super: true } as TUser;
    renderTour(superUser);
    expect(
      screen.getByRole("button", { name: /Manage Tour Authors/i }),
    ).toBeInTheDocument();
  });

  it("shows the Manage Tour Authors button for a tenant admin", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authCtx(tourAuthorUser, true)}>
          <TourRoute />
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("button", { name: /Manage Tour Authors/i }),
    ).toBeInTheDocument();
  });
});
