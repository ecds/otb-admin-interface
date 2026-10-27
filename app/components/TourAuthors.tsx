import {
  Button,
  Checkbox,
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Label,
  Select,
} from "@headlessui/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { faUsers, faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AuthContext, FeedbackContext, TourSetContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { getErrorMessage } from "~/utils/errors";
import { request } from "~/utils/requests";
import DeleteButton from "./buttons/DeleteButton";
import type { TTourAuthorEntry } from "~/types";

const nameOf = (author: TTourAuthorEntry) =>
  author.display_name || author.email;

// The authors of one tour, for site admins: who they are, whether each is a
// student author, and adding or removing them.
const TourAuthors = () => {
  const { currentUser, currentTenantAdmin } = useContext(AuthContext);
  const { tourSet } = useContext(TourSetContext);
  const { setFeedback } = useContext(FeedbackContext);
  const tourId = useTourStore((s) => s.tour?.id);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [authors, setAuthors] = useState<TTourAuthorEntry[]>([]);
  const [candidates, setCandidates] = useState<TTourAuthorEntry[]>([]);
  const [newAuthorId, setNewAuthorId] = useState<string>("");
  const [newIsStudent, setNewIsStudent] = useState<boolean>(false);
  const mayManage = Boolean(currentUser?.super || currentTenantAdmin);
  const base = tourSet ? `${tourSet.subdir}/v4/admin/tour_authors` : "";

  const load = useCallback(async () => {
    if (!tourSet || !tourId) return;
    const [{ data: current, response }, { data: others }] = await Promise.all([
      request({ path: `${base}?tour_id=${tourId}` }),
      request({ path: `${base}/candidates?tour_id=${tourId}` }),
    ]);
    if (response.ok) setAuthors(current as TTourAuthorEntry[]);
    if (Array.isArray(others)) setCandidates(others as TTourAuthorEntry[]);
  }, [base, tourSet, tourId]);

  useEffect(() => {
    if (mayManage && isOpen) load();
  }, [mayManage, isOpen, load]);

  const failed = (
    data: Parameters<typeof getErrorMessage>[0],
    message: string,
  ) => setFeedback({ type: "error", message: getErrorMessage(data, message) });

  const setStudent = async (author: TTourAuthorEntry, student: boolean) => {
    // Shown at once; put back if the save fails.
    setAuthors((list) =>
      list.map((a) => (a.id === author.id ? { ...a, student } : a)),
    );
    const { response, data } = await request({
      path: `${base}/${author.id}`,
      method: "PATCH",
      body: { model: "tour_author", tour_id: tourId, student },
    });
    if (!response.ok) {
      setAuthors((list) =>
        list.map((a) =>
          a.id === author.id ? { ...a, student: author.student } : a,
        ),
      );
      failed(data, `Could not change ${nameOf(author)}.`);
    }
  };

  const remove = async (author: TTourAuthorEntry) => {
    const { response, data } = await request({
      path: `${base}/${author.id}`,
      method: "DELETE",
      body: { model: "tour_author", tour_id: tourId, user_id: author.id },
    });
    if (response.ok) await load();
    else failed(data, `Could not remove ${nameOf(author)}.`);
  };

  const add = async () => {
    if (!newAuthorId) return;
    const { response, data } = await request({
      path: base,
      method: "POST",
      body: {
        model: "tour_author",
        tour_id: tourId,
        user_id: newAuthorId,
        student: newIsStudent,
      },
    });
    if (response.ok) {
      setNewAuthorId("");
      setNewIsStudent(false);
      await load();
    } else {
      failed(data, "Could not add that author.");
    }
  };

  if (!mayManage || !tourSet || !tourId) return <></>;

  return (
    <>
      <Button
        className="bg-black/75 text-white px-2 py-1 mb-8 rounded-md drop-shadow-md active:drop-shadow-sm"
        onClick={() => setIsOpen(true)}
      >
        <FontAwesomeIcon icon={faUsers} aria-hidden="true" /> Manage Tour
        Authors
      </Button>
      <Dialog
        open={isOpen}
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-xl space-y-6 rounded-md bg-white p-8 text-black/75">
              <DialogTitle as="h2" className="text-xl font-semibold text-black">
                Tour authors
              </DialogTitle>
              <p className="text-sm">
                Authors can edit this tour. Student authors can too, but
                can&apos;t publish it, and can remove only stops and images they
                added, before the tour is published.
              </p>

              {authors.length === 0 ? (
                <p>This tour has no authors yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="font-semibold">
                    <tr>
                      <th className="p-2 text-left">Author</th>
                      <th className="p-2 text-center">Student</th>
                      <th className="p-2 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authors.map((author, index) => (
                      <tr
                        key={author.id}
                        className={index % 2 === 0 ? "bg-gray-100" : ""}
                      >
                        <td className="p-2">
                          {nameOf(author)}
                          {author.display_name && (
                            <span className="block text-xs text-black/70">
                              {author.email}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            className="size-4 cursor-pointer"
                            checked={author.student}
                            onChange={(event) =>
                              setStudent(author, event.target.checked)
                            }
                            aria-label={`${nameOf(author)} is a student author`}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <DeleteButton
                            removing="author"
                            label={`Remove ${nameOf(author)}`}
                            description={`Remove ${nameOf(author)}?`}
                            message={`${nameOf(author)} will no longer be able to edit this tour. Remove them`}
                            onDelete={() => remove(author)}
                          >
                            Remove
                          </DeleteButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="space-y-3 border-t border-black/10 pt-4">
                <h3 className="font-semibold text-black">Add an author</h3>
                {candidates.length === 0 ? (
                  <p className="text-sm">
                    Everyone who writes for this site is already an author here.
                    New people can ask for access from the sign-in page.
                  </p>
                ) : (
                  <>
                    <Field className="flex flex-col gap-1">
                      <Label className="text-sm">Person</Label>
                      <Select
                        value={newAuthorId}
                        onChange={(event) => setNewAuthorId(event.target.value)}
                        className="border p-1"
                      >
                        <option value="">Choose someone</option>
                        {candidates.map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {nameOf(candidate)}
                            {candidate.display_name
                              ? ` (${candidate.email})`
                              : ""}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field className="flex items-center gap-2">
                      <Checkbox
                        checked={newIsStudent}
                        onChange={setNewIsStudent}
                        className="group cursor-pointer"
                      >
                        <FontAwesomeIcon
                          icon={newIsStudent ? faSquareCheck : faSquare}
                          className="text-xl group-data-checked:text-blue-600"
                        />
                      </Checkbox>
                      <Label className="cursor-pointer select-none text-sm">
                        Add as a student author
                      </Label>
                    </Field>
                    <button
                      type="button"
                      onClick={add}
                      disabled={!newAuthorId}
                      className="cursor-pointer rounded-md bg-blue-600 px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add author
                    </button>
                    <p className="text-xs">
                      Only people who already write for this site are listed.
                      New people can ask for access from the sign-in page.
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer rounded-md border border-black/50 px-3 py-1"
                >
                  Done
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default TourAuthors;
