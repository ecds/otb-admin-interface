import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import { useLoaderData, useRevalidator, useSearchParams } from "react-router";
import { AuthContext, FeedbackContext } from "~/contexts";
import { request } from "~/utils/requests";
import Navbar from "~/components/Navbar";
import {
  faArrowDown19,
  faArrowDownAZ,
  faArrowUp19,
  faArrowUpAZ,
  faBan,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
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
type SortDirection = "asc" | "decs";

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

const SortIcon = ({ type, name }: { type: string; name: string }) => {
  const [searchParams, _] = useSearchParams();

  if (searchParams.get("sort_field") === name) {
    if (type === "string") {
      return (
        <FontAwesomeIcon
          icon={
            searchParams.get("sort_dir") === "asc" ? faArrowDownAZ : faArrowUpAZ
          }
        />
      );
    } else {
      return (
        <FontAwesomeIcon
          icon={
            searchParams.get("sort_dir") === "asc" ? faArrowDown19 : faArrowUp19
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
  const [sortedUsers, setSortedUsers] = useState<TUser[]>(users);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<TUser | undefined>(undefined);
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const sortFieldRef = useRef<SortField>("email");
  const { setFeedback } = useContext(FeedbackContext);

  useEffect(() => {
    const sortField = searchParams.get("sort_field") as SortField;
    const sortDirection =
      sortFieldRef.current === sortField
        ? (searchParams.get("sort_dir") as SortDirection)
        : "asc";
    if (!sortField) return;
    setSortedUsers(
      [...users].sort((a, b) => {
        const av =
          sortField === "date_joined" || sortField == "last_sign_in"
            ? Date.parse(a[sortField]) || 0
            : a[sortField]?.toLowerCase() || "zz";
        const bv =
          sortField === "date_joined" || sortField == "last_sign_in"
            ? Date.parse(b[sortField]) || 0
            : b[sortField]?.toLowerCase() || "zz";
        if (av < bv) return sortDirection === "asc" ? -1 : 1;
        if (av > bv) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }),
    );
    setFeedback(undefined);
    sortFieldRef.current = sortField;
  }, [searchParams, users, setFeedback]);

  useEffect(() => {
    setModalOpen(Boolean(activeUser));
  }, [activeUser]);

  const updateSort = (sortFieldParam: SortField) => {
    setFeedback({ type: "success", message: "Updating Sort Order" });
    const sortDirectionParam = searchParams.get("sort_dir");
    let sortDirection = "asc";
    if (sortDirectionParam) {
      sortDirection = sortDirectionParam === "asc" ? "decs" : "asc";
    } else {
      sortDirection = sortFieldParam === sortFieldRef.current ? "decs" : "asc";
    }
    setSearchParams({ sort_field: sortFieldParam, sort_dir: sortDirection });
    sortFieldRef.current = sortFieldParam;
  };

  if (!currentUser || !currentUser.super) return <></>;

  return (
    <>
      <Navbar />
      <div className="mt-24">
        <table className="w-11/12 lg:w-3/4 max-w-7xl p-8 m-auto table-fixed mb-24">
          <thead className="">
            <tr className="text-left">
              <th className="ps-2 w-64">
                <button onClick={() => updateSort("email")}>
                  Email <SortIcon type="string" name="email" />
                </button>
              </th>
              <th className="ps-2 max-w-64 hidden md:table-cell">
                <button onClick={() => updateSort("display_name")}>
                  Name <SortIcon type="string" name="display_name" />
                </button>
              </th>
              <th className="ps-2 hidden md:table-cell">Sites</th>
              <th className="ps-2 w-32 hidden md:table-cell">
                <button onClick={() => updateSort("date_joined")}>
                  Joined <SortIcon type="number" name="date_joined" />
                </button>
              </th>
              <th className="ps-2 w-32 hidden md:table-cell">
                <button onClick={() => updateSort("last_sign_in")}>
                  Last Sign In <SortIcon type="number" name="last_sign_in" />
                </button>
              </th>
              <th className="text-center w-24 hidden md:table-cell">
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
