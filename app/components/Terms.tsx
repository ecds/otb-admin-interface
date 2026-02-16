import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useContext } from "react";
import { AuthContext } from "~/contexts";
import { sendUpdate } from "~/utils/requests";

const Terms = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const agree = async () => {
    if (!currentUser) return;
    const { data, response } = await sendUpdate({
      tenant: "public",
      record: currentUser.id,
      body: {
        attribute: "terms_accepted",
        value: true,
        model: "user",
      },
    });

    if (response.ok) setCurrentUser(data);
  };

  return (
    <Dialog
      open={Boolean(currentUser) && !currentUser?.terms_accepted}
      onClose={() => {}}
      className="z-10"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/80" />
      <div className="fixed inset-0 w-screen overflow-y-auto p-4 z-100">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="max-w-2xl space-y-4 border bg-white p-12">
            <DialogTitle className="font-bold text-xl">
              OpenTour Builder Terms of Service
            </DialogTitle>
            <p>Last modified April 26, 2022</p>
            <p>
              Please contact ECDS at ecds@emory.edu with any questions about
              copyright infringement.
            </p>
            <h2 className="text-lg font-bold">1. Introduction</h2>
            <p>
              Thank you for using OpenTour Builder. OpenTour Builder
              (&quot;OpenTour&quot;) is a service made available by the Emory
              Center for Digital Scholarship (&quot;ECDS&quot;, &quot;we&quot;
              or &quot;us&quot;), which is part of Emory University and is
              located at 540 Asbury Circle, Atlanta, Georgia 30322, USA. These
              OpenTour Builder Terms of Service (which we refer to as the
              &quot;Terms&quot;) are a legally binding agreement between you and
              Emory University. They cover your use of and access to OpenTour
              Builder and information you personally create or supply that is
              entered into OpenTour Builder (&quot;Content&quot;). Your use of
              OpenTour Builder requires that you agree to the Terms. Please read
              them carefully. If you do not understand the Terms, or do not
              accept any part of them, then you should not use OpenTour Builder.
              By using OpenTour Builder, you are agreeing to the Terms.
            </p>
            <h2 className="text-lg font-bold">
              2. Your Use of OpenTour Builder
            </h2>
            <p>
              Your OpenTour Account. You will need an OpenTour Account in order
              to use the tour creation features of OpenTour. In order to create
              an OpenTour Account you will need to authorize ECDS to securely
              connect to your social media account (Google) which will confirm
              your ownership of your social media account and provide the ECDS
              with a token that enables you to securely log in to OpenTour. To
              protect your OpenTour Account, keep your connected social media
              account passwords confidential.
            </p>
            <p>
              Your Tour Site Access. All tours in OpenTour are created within a
              Tour Site, a set of tours at a single URL subdomain (&quot;Tour
              Site&quot;). You will need direct contact with an OpenTour admin
              in order to access a Tour Site and be able to create tours. The
              OpenTour administrator will add permissions to your OpenTour
              Account so that you can access a Tour Site, edit Tours, and make
              public (&quot;publish&quot;) Tours.
            </p>
            <p></p>
            <p>
              Your Conduct. Don&apos;t misuse OpenTour. You may use OpenTour
              only as permitted by law and these Terms. You are responsible for
              your conduct and your Content stored in OpenTour and shared
              publicly. Your Content should not include any material that is
              illegal or that infringes or otherwise violates the rights of
              anyone else, including any rights they may have under the law of
              copyrights, trademarks, trade secrets, or privacy. Your Content
              should not be defamatory. ECDS may review your conduct and Content
              in OpenTour for compliance with the Terms. You are responsible for
              the activity that happens on or through your OpenTour Account and
              Content on your Tour Site. ECDS reserves the right to remove any
              Content that does not comply with these Terms or for any other
              reason.
            </p>
            <p>
              Suspension and Termination. You can stop using OpenTour at any
              time. We may suspend or permanently disable your access to
              OpenTour if you violate our Terms or policies or for any other
              reason. We will attempt to give you notice of any suspension or
              disabling of your access to OpenTour based on the contact
              information available to us, but (i) any such notice may arrive
              after suspension or disabling has occurred; (ii) any failure to
              receive notice does not limit our right to disable or suspend your
              account; and (iii) we may suspend or disable your access to
              OpenTour without notice if you are using OpenTour in a manner that
              could cause us legal liability or disrupt other users&apos;
              ability to access and use OpenTour. We respond to notices of
              alleged copyright infringement and will remove Content and
              terminate accounts of infringers in accordance with the U.S.
              Digital Millennium Copyright Act.
            </p>
            <p>
              Emails. ECDS receives your email address through your connected
              social media account. In connection with your use of OpenTour
              Builder, we may send you information related to OpenTour Builder
              functions or updates.
            </p>
            <h2 className="text-lg font-bold">3. Your Content</h2>
            <p>
              Ownership, Licenses. OpenTour Builder allows you to create,
              modify, delete, and link to or iframe Content. You retain
              ownership of any intellectual property rights that you hold in
              that Content. When you create, upload, submit, store, send, or
              receive Content to or through OpenTour, you give ECDS (and those
              we work with) a worldwide license to use, host, store, reproduce,
              modify, create derivative works (such as those resulting from
              adaptations or other changes we make so that your Content works
              better with OpenTour), communicate, publish, publicly perform,
              publicly display, and distribute such Content. The rights you
              grant in this license are for the limited purpose of maintaining,
              operating, promoting, and improving OpenTour and its features.
              This license continues even if you stop using OpenTour unless you
              delete your Content. Make sure you have the necessary rights to
              grant us this license for any Content that you submit to OpenTour.
            </p>

            <p>
              Sharing Your Content. Sharing settings in OpenTour allow you to
              share (&quot;publish&quot;) your Content for the public to view.
              You can also share access to your Tour Site admin, allowing other
              OpenTour users to add to, modify, and delete your Content. The
              sharing features of OpenTour are a critical part of the OpenTour
              app, but please understand that they may enable third parties to
              use and access your Content in ways that ECDS cannot control or
              undo.
            </p>

            <p>
              Privacy, Data Security. Any Content you submit to OpenTour will be
              stored and may be accessible to site administrators, who may
              access and use your Content for the purposes described in the
              license above.
            </p>

            <p>
              Your Content will not be publicly accessible unless you elect to
              make your Content public. Before you choose to make your Content
              publicly accessible, please be sure you understand the
              consequences. Third parties will be able to access, reproduce, and
              use any Content you make public, and ECDS cannot undo or exercise
              any control over such activity.
            </p>

            <p>
              The regular operation of OpenTour will not make your Content
              public unless you choose to do so. We are not responsible for
              ensuring the privacy of your Content and we are unable to
              guarantee that your Content will remain stable, uncorrupted,
              functional, or error free.
            </p>

            <p>
              OpenTour collects and stores basic information about your social
              media account profile when you create your OpenTour Account.
              OpenTour only uses this information to facilitate your ability to
              securely log in to OpenTour and will not make it public.
            </p>

            <p>
              Indemnification. You will hold harmless, defend, and indemnify
              Emory University and its affiliates, officers, agents, and
              employees from any claim, suit, or action arising from or related
              to your use of OpenTour, any Content, or any violation of these
              Terms, including any liability or expense arising from claims,
              losses, damages, suits, judgments, litigation costs, and
              attorneys&apos; fees.
            </p>

            <h2 className="text-lg font-bold">
              4. About Software in our Services
            </h2>

            <p>
              OpenTour Builder is open source software licensed under the MIT
              License. ECDS promotes the development and use of open source
              software and invites collaboration in the further development of
              OpenTour Builder. You can download and install OpenTour and see
              our license from the ECDS GitHub account.
            </p>

            <h2 className="text-lg font-bold">5. Modifying and Terminating</h2>

            <p>
              OpenTour Changes to OpenTour or these Terms. We are continuing to
              improve and develop OpenTour. You acknowledge that the form and
              nature of OpenTour may change from time to time. We will endeavor
              to provide public notice of material changes to OpenTour that we
              reasonably believe will adversely impact your use of OpenTour.
              However, there are times when we will make changes to OpenTour
              without giving notice.
            </p>

            <p>
              Discontinuation of OpenTour. We reserve the right to discontinue
              development or maintenance of OpenTour. We also reserve the right
              to discontinue this OpenTour site (https://opentour.site). Contact
              ecds@emory.edu if you have questions about preserving your Content
              in OpenTour in the event of discontinuation.
            </p>
            <h2 className="text-lg font-bold">
              6. Warranties, Disclaimers, and Limitations on Liability
            </h2>

            <p>
              A great deal of work has gone into the creation of OpenTour, and
              we are regularly working to maintain and improve OpenTour. But
              there are certain things that we don&apos;t promise about
              OpenTour.
            </p>

            <p>
              OTHER THAN AS EXPRESSLY SET OUT IN THESE TERMS, NEITHER EMORY
              UNIVERSITY NOR ANY OF ITS AFFILIATED ENTITIES MAKE ANY SPECIFIC
              PROMISES ABOUT OPENTOUR. FOR EXAMPLE, WE DON&apos;T MAKE ANY
              COMMITMENTS ABOUT THE CONTENT WITHIN OPENTOUR, THE SPECIFIC
              FUNCTIONS OF OPENTOUR, OR THEIR RELIABILITY, AVAILABILITY, OR
              ABILITY TO MEET YOUR NEEDS. WE PROVIDE OPENTOUR “AS IS.” TO THE
              EXTENT PERMITTED BY LAW, WE EXCLUDE AND DISCLAIM ALL WARRANTIES.
            </p>

            <p>
              NEITHER EMORY UNIVERSITY NOR ANY OF ITS AFFILIATED ENTITIES WILL
              BE RESPONSIBLE FOR (1) ANY LOST PROFITS, REVENUES, OR FINANCIAL
              LOSSES, (2) ANY LOST, DESTROYED, OR CORRUPTED DATA OR INFORMATION,
              (3) ANY DATA OR INFORMATION THAT IS ACCESSED BY THIRD PARTIES
              WITHOUT AUTHORIZATION, OR (4) ANY INDIRECT, SPECIAL,
              CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES.
            </p>

            <p>
              TO THE EXTENT PERMITTED BY LAW, THE TOTAL LIABILITY OF EMORY
              UNIVERSITY AND ANY OF ITS AFFILIATED ENTITIES, FOR ANY CLAIMS
              UNDER THESE TERMS OR ANY CLAIM ARISING FROM YOUR USE OF OPENTOUR,
              INCLUDING FOR ANY IMPLIED WARRANTIES, IS LIMITED TO THE AMOUNT YOU
              PAID US TO USE OPENTOUR (OR, IF WE CHOOSE, TO SUPPLYING YOU WITH
              OPENTOUR AGAIN).
            </p>

            <p>
              IN ALL CASES, EMORY UNIVERSITY AND ALL ITS AFFILIATED ENTITIES
              WILL NOT BE LIABLE FOR ANY LOSS OR DAMAGE THAT IS NOT REASONABLY
              FORESEEABLE.
            </p>

            <h2 className="text-lg font-bold">7. Laws Governing the Terms</h2>

            <p>
              The laws of the State of Georgia, USA, excluding Georgia&apos;s
              conflict of laws rules, will apply to any disputes arising out of
              or relating to these Terms or any other matter relating to your
              use of OpenTour. All claims arising out of or relating to these
              Terms or OpenTour must be litigated exclusively in the state
              courts of DeKalb County, Georgia, USA, or the federal courts in
              the United States District Court for the Northern District of
              Georgia. You and Emory consent to personal jurisdiction in those
              courts and waive any objections based on improper or inconvenient
              forum.
            </p>

            <h2 className="text-lg font-bold">8. About these Terms</h2>

            <p>
              We may modify these Terms and supply additional terms that apply
              to OpenTour. Changes may be needed for a variety of reasons, such
              as: new features or other modifications of OpenTour; changes in
              law, custom, or political or economic policy; new guidelines
              issued by regulators or relevant industry bodies; or the
              operational, compliance, or other needs or obligations of ECDS.
              We&apos;ll post notice of modifications or additions to these
              Terms on this page. You should visit this page regularly to check
              for updates. We will make every effort to provide you with advance
              notice of any material changes or additions to these terms.
              Modifications or additions to these Terms will go into effect as
              of the date indicated on this page, and some changes may be
              effective immediately. If you do not agree to any new or modified
              terms, you should discontinue your use of OpenTour. These Terms
              control the relationship between ECDS and you. They do not create
              any third party beneficiary rights. If you do not comply with
              these Terms, and we don&apos;t take action right away, this
              doesn&apos;t mean that we are giving up any rights that we may
              have (such as taking action in the future). If it turns out that a
              particular term is not enforceable, this will not affect any other
              terms.
            </p>

            <p>
              For information about how to contact ECDS, please visit our
              contact page.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={agree}
                className="bg-blue-500 px-4 py-2 rounded-md drop-shadow-md hover:bg-blue-700 text-white"
              >
                Agree
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default Terms;
