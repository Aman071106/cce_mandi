import React, { useContext } from "react";
import Image from "next/image";
import { AppWindow, Calendar, Clock, Mail, Pin } from "lucide-react";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { UserContext } from "@/context/user-context";
import toast from "react-hot-toast";
import { registerUserInMailingList } from "@/lib/actions";
import Link from "next/link";
import Button from "@/components/button/button";

interface Props {
  props: {
    id: string;
    name: string;
    img: string | StaticImport;
    date: string;
    time: string;
    location: string;
    desc: string;
    by: string;
    contact: string;
    completed: boolean;
    gallery: string;
    slides: string;
  };
  regEvents: string[] | undefined;
  setRegEvents: (event: string[]) => void;
}

const EventSection = ({ props, regEvents, setRegEvents }: Props) => {
  const { currentUserID } = useContext(UserContext);

  const registerUser = async () => {
    if (currentUserID) {
      // show warning before registering
      const confirmed = window.confirm(
        "⚠️ Once you register, you cannot unregister. Do you want to continue?"
      );
      if (!confirmed) return;

      await registerUserInMailingList(props.id, currentUserID);
      if (regEvents) {
        if (!regEvents.includes(props.name)) {
          setRegEvents([...regEvents, props.name]);
          toast.success("Registration successful!");
        } else {
          toast("You've already registered!");
        }
      } else {
        setRegEvents([props.name]);
        toast.success("Registration successful!");
      }
    } else {
      toast.error("You need to log in first!");
    }
  };

  const isUserRegistered = () => {
    return regEvents?.includes(props.name);
  };

  return (
    <div
      className="border-t-[200px] mt-[-200px] border-t-transparent bg-clip-padding flex flex-col lg:flex-row lg:py-12 font-medium items-center lg:items-stretch"
      id={`event-${props.id}`}
    >
      <Image
        src={props.img}
        width={1920}
        height={1080}
        alt={props.name || "Undefined Event"}
        className="w-full sm:w-[500px] lg:w-[300px] min-h-[300px] object-cover mb-5 lg:mb-0"
      />
      <div className="w-full lg:w-[calc(100vw-600px)] lg:px-5">
        <div className="text-4xl md:text-5xl font-semibold tracking-tight md:leading-normal mb-5">
          {props.name || "Undefined Event"}
        </div>
        <div className="font-normal max-w-screen-lg">
          {props.desc ||
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae quam nec elit gravida condimentum. Aenean faucibus quam facilisis nibh viverra, eget congue nisl aliquet."}
        </div>
      </div>
      <div className="mt-5 py-5 lg:mt-0 lg:py-0 w-full lg:w-[350px] border-b-2 lg:border-b-0 lg:border-l-2 border-zinc-900/[0.1] lg:px-5 flex flex-col items-start relative">
        <div className="text-base text-zinc-400 mb-5">
          Offered by {props.by || "no one"}
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-row gap-2.5 items-center">
            <Calendar size={24} />
            {props.date || "TBD"}
          </div>
          <div className="flex flex-row gap-2.5 items-center">
            <Clock size={24} />
            {props.time || "TBD"}
          </div>
          <div className="flex flex-row gap-2.5 items-center">
            <Pin size={24} />
            {props.location || "TBD"}
          </div>
          {props.completed ? (
            <Link href={props.slides || "/"} target={"_blank"}>
              <div className="flex flex-row gap-2.5 mt-2.5 items-center text-sky-500">
                <AppWindow size={24} />
                Session slides
              </div>
            </Link>
          ) : (
            <Link href={`mailto:${props.contact}`}>
              <div className="flex flex-row gap-2.5 mt-2.5 items-center text-sky-500">
                <Mail size={24} />
                {props.contact || "90909 09090"}
              </div>
            </Link>
          )}
        </div>
        <div className="mt-5 lg:mt-0 lg:absolute lg:bottom-0 lg:left-5">
          {!props.completed ? (
            <Button
              onClick={isUserRegistered() ? () => toast("You are already registered!") : registerUser}
              variant={isUserRegistered() ? "black" : "gradient"}
            >
              {isUserRegistered() ? "Registered" : "Register"}
            </Button>
          ) : (
            <Link href={props.gallery || "/"} target={"_blank"}>
              <Button variant={"gradient"}>Gallery</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventSection;
