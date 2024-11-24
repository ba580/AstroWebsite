import React, { useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid"; 

const Header = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false); 

  const toggleDropdown = () => setIsOpen((prev) => !prev); 

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 py-4 px-8 md:px-16 lg:px-24 transition duration-500 backdrop-blur-md shadow-sm`}
    >
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/astro-logo.svg"
            alt="Astro Birb Logo"
            className="w-10 h-10 md:w-12 md:h-12 transition duration-300 group-hover:scale-105"
          />
          <span className="hidden sm:block text-3xl font-bold">Birb</span>
        </Link>
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link
            href="/docs"
            className="text-gray-300 hover:text-indigo-400 transition font-medium hidden lg:block"
          >
            Docs
          </Link>
          <Link
            href="https://patreon.com/astrobirb"
            className="text-gray-300 hover:text-indigo-400 transition font-medium hidden lg:block"
          >
            Patreon
          </Link>

          {session ? (
            <Menu as="div" className="relative inline-block text-left z-10">
              <div>
                <Menu.Button
                  onClick={toggleDropdown} 
                  className="inline-flex w-full justify-center items-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                >
                  <img
                    src={session.user?.image || "/default-avatar.jpg"}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  {session.user?.name || session.user?.email}
                  <ChevronDownIcon
                    className={`-mr-1 ml-2 h-5 w-5 text-white transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`} 
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-2 py-2">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut()}
                          className={`${
                            active
                              ? "bg-gray-800 text-white"
                              : "text-gray-300"
                          } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                        >
                          Sign Out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <button
              onClick={() => signIn()}
              className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-600 transition text-white font-medium"
            >
              Login
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
