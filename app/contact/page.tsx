import React from "react";
import ContactHeader from "@/components/contact/contact-header";
import Alert from "@/components/alert/alert";
import ContactCard from "@/components/contact/contact-card";

const ContactPage = () => {
	return (
		<div className="fade-in-page">
			<ContactHeader/>
			<div className="flex flex-col items-center px-5 py-12 pb-24 md:px-12">
				<Alert variant="warning">
					We prefer mails/texts over calls, so that we can reply at our own
					convenience.
				</Alert>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 px-12 pb-24">
				<div
					className="md:col-span-2 xl:col-span-3 text-4xl md:text-6xl font-semibold tracking-tight text-center md:text-left">
					SnTC Team
				</div>
				
				<ContactCard
					name={"Aryan Singh"}
					phone={6393051440}
					mail={"b22260@students.iitmandi.ac.in"}
				/>
				
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 px-12 pb-24">
				<div
					className="md:col-span-2 xl:col-span-3 text-4xl md:text-6xl font-semibold tracking-tight text-center md:text-left">
					TIP Website Team
				</div>
				<ContactCard
					name={"Shubham S Padhi"}
					mail={"b23295@students.iitmandi.ac.in"}
					phone={9043674629}
				/>
				<ContactCard
					name={"Vinamra Garg"}
					mail={"b23302@students.iitmandi.ac.in"}
					phone={9350555053}
				/>
				<ContactCard
					name={"Aman Gupta"}
					mail={"b24107@students.iitmandi.ac.in"}
					phone={7597759385}
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 px-12 pb-24">
				<div
					className="md:col-span-2 xl:col-span-3 text-4xl md:text-6xl font-semibold tracking-tight text-center md:text-left">
					Technical Society Clubs
				</div>
				<ContactCard name={"KamandPrompt"} mail={"pc@iitmandi.ac.in"}/>
				<ContactCard
					name={"Yantrik Club"}
					mail={"yantrik_club@students.iitmandi.ac.in"}
				/>
				<ContactCard
					name={"Robotronics Club"}
					mail={"robotronics@students.iitmandi.ac.in"}
				/>
				<ContactCard name={"E-Cell"} mail={"edc@students.iitmandi.ac.in"}/>
				<ContactCard
					name={"Space Technology and Astronomy Club"}
					mail={"stac@students.iitmandi.ac.in"}
				/>
				<ContactCard
					name={"Society of Automotive Engineers"}
					mail={"supra@students.iitmandi.ac.in"}
				/>
				<ContactCard
					name={"Nirmaan Club"}
					mail={"nirmaan_club@students.iitmandi.ac.in"}
				/>
				<ContactCard
					name={"System Administration and Infosec Cell"}
					mail={"saic@students.iitmandi.ac.in"}
				/>
			</div>
		</div>
	);
};

export default ContactPage;
