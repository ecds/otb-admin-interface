import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useContext,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useLoaderData, useRevalidator, useSearchParams } from "react-router";
import { AuthContext } from "~/contexts";
import { request } from "~/utils/requests";
import Navbar from "~/components/Navbar";
import {
  faArrowDown19,
  faArrowDownAZ,
  faArrowUp19,
  faArrowUpAZ,
  faBan,
  faCheckCircle,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import type { ShouldRevalidateFunction } from "react-router";
import type { TTourSet, TUser } from "~/types";
import {
  Button,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import UserTourSet from "~/components/UserTourSet";

type SortField = "email" | "display_name" | "date_joined" | "last_sign_in";
type SortDirection = "asc" | "desc";

const SORT_PARAMS = ["sort_field", "sort_dir", "filter"];
const DATE_FIELDS: SortField[] = ["date_joined", "last_sign_in"];

export const clientLoader = async () => {
  const { data: users } = await request({
    path: `public/v4/admin/users`,
  });

  const { data: tour_sets } = await request({
    path: "public/v4/admin/tour_sets",
  });

  return { users, tour_sets };
};

clientLoader.hydrate = true as const;

// Sorting is client-side, so changing only the sort params shouldn't refetch.
// revalidator.revalidate() keeps the URL the same, so it still reloads.
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  const onlySortChanged =
    currentUrl.pathname === nextUrl.pathname &&
    currentUrl.search !== nextUrl.search &&
    [...currentUrl.searchParams.keys(), ...nextUrl.searchParams.keys()].every(
      (key) => SORT_PARAMS.includes(key),
    );
  return onlySortChanged ? false : defaultShouldRevalidate;
};

const sortUsers = (
  users: TUser[],
  field: SortField = "email",
  direction: SortDirection,
  filter: string,
) => {
  const value = (user: TUser) =>
    DATE_FIELDS.includes(field)
      ? Date.parse(user[field]) || 0
      : user[field]?.toLowerCase() || "zz";
  const sign = direction === "desc" ? -1 : 1;

  return [...users]
    .filter((user) => {
      if (filter && filter.length > 0) {
        return (
          user.email.includes(filter) || user.display_name?.includes(filter)
        );
      } else {
        return user;
      }
    })
    .sort((a, b) => {
      const av = value(a);
      const bv = value(b);
      if (av < bv) return -sign;
      if (av > bv) return sign;
      return 0;
    });
};

const SortIcon = ({ type, name }: { type: string; name: string }) => {
  const [searchParams, _] = useSearchParams();

  if (searchParams.get("sort_field") === name) {
    if (type === "string") {
      return (
        <FontAwesomeIcon
          icon={
            searchParams.get("sort_dir") === "desc"
              ? faArrowUpAZ
              : faArrowDownAZ
          }
        />
      );
    } else {
      return (
        <FontAwesomeIcon
          icon={
            searchParams.get("sort_dir") === "desc"
              ? faArrowUp19
              : faArrowDown19
          }
        />
      );
    }
  }

  return (
    <FontAwesomeIcon
      icon={type === "string" ? faArrowDownAZ : faArrowDown19}
      className="opacity-20"
    />
  );
};

const UsersRoute = () => {
  const { users, tour_sets } = useLoaderData<{
    users: TUser[];
    tour_sets: TTourSet[];
  }>();
  const { currentUser } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<TUser | undefined>(undefined);
  const [filter, setFilter] = useState<string>("");
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  const sortField = searchParams.get("sort_field") as SortField | null;
  const sortDirection: SortDirection =
    searchParams.get("sort_dir") === "desc" ? "desc" : "asc";

  const sortedUsers = useMemo(
    () =>
      sortField || filter
        ? sortUsers(users, sortField ?? "email", sortDirection, filter)
        : users,
    [users, sortField, sortDirection, filter],
  );

  useEffect(() => {
    setModalOpen(Boolean(activeUser));
  }, [activeUser]);

  // Same column flips the direction; a new column starts ascending.
  const updateSort = (field: SortField) => {
    const direction: SortDirection =
      field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSearchParams({
      ...Object.fromEntries(searchParams),
      sort_field: field,
      sort_dir: direction,
    });
  };

  const updateFilter = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setFilter(target.value);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      filter: target.value,
    });
  };

  const clearFilter = () => {
    setFilter("");
    const remaining = Object.fromEntries(searchParams);
    delete remaining.filter;
    setSearchParams(remaining);
  };

  if (!currentUser || !currentUser.super) return <></>;

  return (
    <>
      <Navbar />
      <div className="mt-24 h-screen overflow-y auto">
        <table className="w-11/12 lg:w-3/4 max-w-7xl p-8 m-auto table-fixed mb-24 bg-white">
          <thead className="sticky top-12 mb-8 bg-white w-full z-10">
            <tr className="w-full">
              <th className="relative w-auto pt-4" colSpan={2}>
                <input
                  type="text"
                  placeholder="filter"
                  value={filter}
                  onChange={updateFilter}
                  className="peer w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  id="clear-btn"
                  className={`absolute inset-y-0 right-0 ${filter ? "flex" : "hidden"} items-center pt-3 pr-3 text-slate-400 hover:text-slate-600`}
                  aria-label="Clear input"
                  onClick={clearFilter}
                >
                  <FontAwesomeIcon icon={faX} />
                </button>
              </th>
              <th className="pt-4" colSpan={4}></th>
            </tr>
            <tr className="text-left">
              <th className="ps-2 w-64 py-3">
                <button onClick={() => updateSort("email")}>
                  Email <SortIcon type="string" name="email" />
                </button>
              </th>
              <th className="ps-2 max-w-64 hidden md:table-cell py-3">
                <button onClick={() => updateSort("display_name")}>
                  Name <SortIcon type="string" name="display_name" />
                </button>
              </th>
              <th className="ps-2 hidden md:table-cell py-3">Sites</th>
              <th className="ps-2 w-32 hidden md:table-cell">
                <button onClick={() => updateSort("date_joined")}>
                  Joined <SortIcon type="number" name="date_joined" />
                </button>
              </th>
              <th className="ps-2 w-32 hidden md:table-cell py-3">
                <button onClick={() => updateSort("last_sign_in")}>
                  Last Sign In <SortIcon type="number" name="last_sign_in" />
                </button>
              </th>
              <th className="text-center w-24 hidden md:table-cell py-3">
                Terms Accepted
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => {
              return (
                <tr
                  key={user.id}
                  className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-white"} hover:bg-gray-200 py-8 my-8 h-10 text-black/75`}
                >
                  <td
                    className="overflow-hidden whitespace-nowrap text-ellipsis ps-2"
                    title={user.email}
                  >
                    <Button
                      onClick={() => setActiveUser(user)}
                      className={"text-blue-500 hover:text-blue-700 underline"}
                    >
                      {user.email}
                    </Button>
                  </td>
                  <td
                    className="overflow-hidden whitespace-nowrap text-ellipsis px-2 hidden md:table-cell"
                    title={user.display_name}
                  >
                    {user.display_name ?? "-"}
                  </td>
                  <td className="px-2 hidden md:table-cell">
                    {user.tour_sets.map((ts) => ts.name).join(", ")}
                  </td>
                  <td className="px-2 hidden md:table-cell">
                    {user.date_joined}
                  </td>
                  <td className="px-2 hidden md:table-cell">
                    {user.last_sign_in || (
                      <span className="italic text-red-500/75 block text-center">
                        - NEVER -
                      </span>
                    )}
                  </td>
                  <td className="text-center hidden md:table-cell">
                    <FontAwesomeIcon
                      icon={user.terms_accepted ? faCheckCircle : faBan}
                      className={
                        user.terms_accepted
                          ? "text-green-600"
                          : "text-gray-400 -rotate-45"
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Dialog
        open={modalOpen}
        onClose={() => {
          setActiveUser(undefined);
          revalidator.revalidate();
        }}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30"></DialogBackdrop>
        <div className="fixed inset-0 w-screen p-4 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="max-w-xl space-y-4 border bg-white p-8 rounded-md text-black/75">
              <DialogTitle
                as="h3"
                className="text-base/7 font-medium text-black"
              >
                {activeUser?.email}
              </DialogTitle>
              <Description className={"grid grid-cols-4 gap-2"}>
                <div className="">Joined:</div>
                <div className="col-span-3">{activeUser?.date_joined}</div>
                <div className="">Last Sign In:</div>
                <div className="col-span-3">
                  {activeUser?.last_sign_in ?? (
                    <span className="italic text-red-400">Never</span>
                  )}
                </div>
              </Description>
              <div>
                {tour_sets.map((tourSet) => {
                  if (activeUser) {
                    return (
                      <UserTourSet
                        key={tourSet.subdir}
                        user={activeUser}
                        tourSet={tourSet}
                      />
                    );
                  }
                })}
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default UsersRoute;
