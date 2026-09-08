import { faSquare, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Checkbox } from "@headlessui/react";
import { Fragment, useContext, useState } from "react";
import { FeedbackContext } from "~/contexts";
import type { TTourSet, TUser } from "~/types";
import { sendCreate, sendDelete } from "~/utils/requests";
import { getErrorMessage } from "~/utils/errors";

interface Props {
  tourSet: TTourSet;
  user: TUser;
}

const UserTourSet = ({ tourSet, user }: Props) => {
  const [value, setValue] = useState<boolean>(
    user.tour_sets.map((ts) => ts.subdir).includes(tourSet.subdir),
  );
  const { setFeedback } = useContext(FeedbackContext);

  const handleChange = async () => {
    if (value) {
      // value is still true, so we delete the record.
      const tourSetAdmin = user.tour_sets.find(
        (ts) => ts.subdir === tourSet.subdir,
      );
      if (!tourSetAdmin) return; // Abort if not actually found
      const { response, data } = await sendDelete({
        tenant: "public",
        record: tourSetAdmin.id,
        body: {
          model: "tour_set_admin",
        },
      });

      if (response.ok) {
        setValue(!value);
      } else {
        setFeedback({
          type: "error",
          message: getErrorMessage(data, "Could not remove access."),
        });
      }
    } else {
      const { response, data } = await sendCreate({
        tenant: "public",
        body: {
          model: "tour_set_admin",
          tour_set_admin: {
            user_id: user.id,
            tour_set_id: tourSet.id,
          },
        },
      });

      if (response.ok) {
        setValue(!value);
      } else {
        setFeedback({
          type: "error",
          message: getErrorMessage(data, "Could not grant access."),
        });
      }
    }
  };

  return (
    <div className="flex flex-row">
      <Checkbox as={Fragment} value={value} onChange={handleChange}>
        <FontAwesomeIcon
          icon={value ? faSquareCheck : faSquare}
          className="self-center cursor-pointer"
        />
      </Checkbox>
      <div>{tourSet.name}</div>
    </div>
  );
};

export default UserTourSet;
