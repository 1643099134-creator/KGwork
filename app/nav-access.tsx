'use client';
import {createContext,useContext} from 'react';
const Access=createContext<{team:string;role:string}[]>([]);
export default function NavAccess({roles,children}:{roles:{team:string;role:string}[];children:React.ReactNode}){return <Access.Provider value={roles}>{children}</Access.Provider>;}
export function useNavAccess(){return useContext(Access);}
