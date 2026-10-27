import { useContext } from "react";
import { Link } from "react-router";
import Navbar from "~/components/Navbar";
import DeleteAccount from "~/components/DeleteAccount";
import RequestAccess from "~/components/RequestAccess";
import { AuthContext } from "~/contexts";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Your profile" }];

// Who you are signed in as, what you can work on, and asking for access to
// other sites.
const ProfileRoute = () => {
  const { currentUser, setShowTerms } = useContext(AuthContext);

  if (!currentUser) return <></>;

  const roleOn = (role?: string) =>
    role === "Tour Creator" ? "Tour creator" : "Site admin";

  return (
    <>
      <Navbar />
      <main className="mx-auto my-24 w-11/12 max-w-4xl space-y-12 text-black/75">
        <section aria-labelledby="profile-heading" className="space-y-2">
          <h1 id="profile-heading" className="text-3xl">
            {currentUser.display_name || currentUser.email}
          </h1>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1">
            <dt className="font-medium">Signed in as</dt>
            <dd>{currentUser.email}</dd>
            {currentUser.date_joined && (
              <>
                <dt className="font-medium">Joined</dt>
                <dd>{currentUser.date_joined}</dd>
              </>
            )}
            {currentUser.last_sign_in && (
              <>
                <dt className="font-medium">Last signed in</dt>
                <dd>{currentUser.last_sign_in}</dd>
              </>
            )}
            <dt className="font-medium">Terms of use</dt>
            <dd>
              {currentUser.terms_accepted ? "Accepted" : "Not accepted yet"}
              {" · "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="cursor-pointer text-blue-700 underline hover:text-blue-900"
              >
                Read the terms
              </button>
            </dd>
          </dl>
          <p className="text-sm">
            Your sites and tours are tied to this Google account. If something
            is missing, check that you signed in with the account you used
            before.
          </p>
        </section>

        <section aria-labelledby="access-heading" className="space-y-4">
          <h2 id="access-heading" className="text-2xl">
            What you can work on
          </h2>
          {currentUser.super ? (
            <p>You&apos;re a super user, so you can work on every site.</p>
          ) : currentUser.tour_sets.length === 0 &&
            (currentUser.tours?.length ?? 0) === 0 ? (
            <p>You haven&apos;t been added to any sites or tours yet.</p>
          ) : (
            <>
              {currentUser.tour_sets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Sites</h3>
                  <ul className="ms-6 list-disc">
                    {currentUser.tour_sets.map((site) => (
                      <li key={site.subdir}>
                        <Link
                          to={`/${site.subdir}/`}
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          {site.name}
                        </Link>{" "}
                        <span className="text-sm">({roleOn(site.role)})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {currentUser.tours?.map(
                ({ tour_set, tours, student_tour_ids }) => (
                  <div key={tour_set.subdir}>
                    <h3 className="text-lg font-semibold">
                      Tours on {tour_set.name}
                    </h3>
                    <ul className="ms-6 list-disc">
                      {tours.map((tour) => (
                        <li key={tour.id}>
                          <Link
                            to={`/${tour_set.subdir}/edit/${tour.id}`}
                            className="text-blue-700 underline hover:text-blue-900"
                          >
                            {tour.title}
                          </Link>{" "}
                          <span className="text-sm">
                            (
                            {student_tour_ids?.includes(tour.id)
                              ? "Student author"
                              : "Author"}
                            )
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </>
          )}
        </section>

        <section
          id="request-access"
          aria-labelledby="request-access-heading"
          className="space-y-4"
        >
          <h2 id="request-access-heading" className="text-2xl">
            Request access to another site
          </h2>
          <RequestAccess />
        </section>

        <section aria-labelledby="delete-account-heading" className="space-y-4">
          <h2 id="delete-account-heading" className="text-2xl">
            Delete your account
          </h2>
          <DeleteAccount />
        </section>
      </main>
    </>
  );
};

export default ProfileRoute;
