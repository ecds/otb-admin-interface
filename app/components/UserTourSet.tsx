import { faSquare, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Checkbox } from "@headlessui/react";
import { Fragment, useState } from "react";
import type { TTourSet, TUser } from "~/types";
import { sendCreate, sendDelete } from "~/utils/requests";

interface Props {
  tourSet: TTourSet;
  user: TUser;
}

const UserTourSet = ({ tourSet, user }: Props) => {
  const [value, setValue] = useState<boolean>(
    user.tour_sets.map((ts) => ts.subdir).includes(tourSet.subdir),
  );

  const handleChange = async () => {
    if (value) {
      // value is still true, so we delete the record.
      const tourSetAdmin = user.tour_sets.find(
        (ts) => ts.subdir === tourSet.subdir,
      );
      if (!tourSetAdmin) return; // Abort if not actually found
      const { response } = await sendDelete({
        tenant: "public",
        record: tourSetAdmin.id,
        body: {
          model: "tour_set_admin",
        },
      });

      if (response.ok) setValue(!value);
    } else {
      const { response } = await sendCreate({
        tenant: "public",
        body: {
          model: "tour_set_admin",
          tour_set_admin: {
            user_id: user.id,
            tour_set_id: tourSet.id,
          },
        },
      });

      if (response.ok) setValue(!value);
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
