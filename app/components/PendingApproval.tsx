import { faBell } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  CloseButton,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import type { TAccessRequest } from "~/types";
import UserPendingAccessRequest from "./UserPendingAccessRequest";

const PendingApproval = ({
  accessRequests,
}: {
  accessRequests: TAccessRequest[];
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!accessRequests || accessRequests.length == 0) return <></>;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={
          "bg-amber-600 text-white px-2 py-1 mb-8 rounded-md drop-shadow-md active:drop-shadow-sm"
        }
      >
        <FontAwesomeIcon icon={faBell} /> Pending Access Requests
      </Button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30"></DialogBackdrop>
        <div className="fixed inset-0 w-screen p-4 overflow-y-auto">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-11/12 space-y-4 border bg-white p-8 rounded-md overflow-visible">
              <div className="flex p-0 m-0 h-min justify-end w-full">
                <CloseButton
                  className={
                    "text-right text-xs border-2 border-black/45 py-1 px-2 rounded-md hover:bg-black/15"
                  }
                  aria-label="close dialog"
                >
                  DONE
                </CloseButton>
              </div>
              <DialogTitle className={"font-bold text-black/75 text-2xl"}>
                Pending Access Requests
              </DialogTitle>
              <Description>
                Below are pending requests for full access to this tour site.
                You can limit the person&apos;s access to a specific tour by
                selecting it in the dropdown before clicking approve.
              </Description>
              <table className="w-full text-sm">
                <thead className="font-bold">
                  <tr>
                    <td>Requester</td>
                    <td>Email</td>
                    <td>Tour(s)</td>
                    <td className="text-center">Deny</td>
                    <td className="text-center">Approve</td>
                  </tr>
                </thead>
                <tbody>
                  {accessRequests.map((request, index) => {
                    return (
                      <UserPendingAccessRequest
                        key={request.id}
                        index={index}
                        request={request}
                      />
                    );
                  })}
                </tbody>
              </table>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PendingApproval;
