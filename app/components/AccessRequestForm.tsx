import {
  Checkbox,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Fieldset,
  Label,
} from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { request } from "~/utils/requests";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import type { TTourSet } from "~/types";

interface Props {
  site: TTourSet | undefined;
}

const AccessRequestForm = ({ site }: Props) => {
  const [siteTours, setSiteTours] = useState<
    { title: string; slug: string; id: number }[] | undefined
  >(undefined);

  useEffect(() => {
    const getTours = async () => {
      if (!site) return;

      const { data, response } = await request({
        path: `${site.subdir}/v4/admin/tours?all=true`,
        method: "GET",
      });

      if (response.ok) setSiteTours(data);
    };
    if (site) getTours();
  }, [site]);

  if (site) {
    return (
      <>
        <Fieldset>
          <Disclosure as="div">
            {({ open }) => (
              <>
                <DisclosureButton className="group mb-4 font-bold text-xl text-black/75">
                  <span className="underline underline-offset-4 decoration-dashed">
                    Select specific tour{" "}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="transition duration-300 group-data-open:rotate-180"
                  />
                </DisclosureButton>
                <AnimatePresence initial={false}>
                  {open && (
                    <DisclosurePanel static as={Fragment}>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.3, ease: easeOut }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <>
                          {siteTours?.map((tour) => {
                            return (
                              <div
                                key={tour.slug}
                                className="flex flex-row space-x-1 mb-2"
                              >
                                <Checkbox
                                  name="tour_ids"
                                  // className="group block cursor-pointer"
                                  value={tour.id}
                                  as={Fragment}
                                >
                                  {({ checked }) => (
                                    <FontAwesomeIcon
                                      icon={checked ? faSquareCheck : faSquare}
                                      className="self-center cursor-pointer"
                                    />
                                  )}
                                </Checkbox>
                                <Label className="cursor-pointer">
                                  {tour.title}
                                </Label>
                              </div>
                            );
                          })}
                        </>
                      </motion.div>
                    </DisclosurePanel>
                  )}
                </AnimatePresence>
              </>
            )}
          </Disclosure>
        </Fieldset>
        <p className="mt-2 text-sm/6 text-black/75">
          This will send an email to the admins of{" "}
          <i className="font-bold">{site.name}</i> with your name and email.
        </p>
      </>
    );
  }

  return <></>;
};

export default AccessRequestForm;
