'use client'
import ListTable from '@/components/ListTable';
import CustomSelectBox from '@/components/CustomSelectBox'; // Assuming you have this component
import axios from 'axios';
import React, { useEffect, useState } from 'react'

function page() {
  const [categories, setcategories] = useState([])
  const [category, setcategory] = useState("")
  const [name, setname] = useState("")
  const [description, setdescription] = useState("")
  const [currentIndex, setcurrentIndex] = useState(0)
  const [showPopup, setshowPopup] = useState(false)
  const fetchEmployees = async () => {
    let res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/users`,{ withCredentials: true });
    res.data.users.map(user => {
      
        setUsers((prev) => [...prev, [user._id, user.name, user.email, user.category]])
      
    })
  }
  useEffect(() => {
    const fetchCategories = async () => {
      let res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`);
      res.data.categories.map(category => {
        if (!categories.includes(category.name)) {
          setcategories((prev) => [...prev, category.name])
        }
      })
    }
    fetchCategories();
  }, [])

  const [users, setUsers] = useState([])
  
  const onEdit = (e) => {
    const key = e.target.getAttribute('data-key');
    setcurrentIndex(Number(key))
    setname(users[key][1])
    setcategory(users[key][3])
    setshowPopup(true)
  }

  const onUpdate = async (e) => {
    e.preventDefault();
    try {

      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/user/${users[currentIndex][0]}`, { name, category },{ withCredentials: true });
      console.log("response ",res)
      setUsers([])
      fetchEmployees();
      setshowPopup(false)
    } catch (error) {
      console.log("some error", error)
    }
  }

  const onDelete = async (e) => {
    const key = e.target.getAttribute('data-key');
    setcurrentIndex(Number(key))
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/user/${users[Number(key)][0]}`,{ withCredentials: true });
      console.log("response ",res)
      
      setUsers([])
      fetchEmployees();
    } catch (error) {
      console.log("some error", error)
    }
  }



  useEffect(() => {
    fetchEmployees();
  }, [])

  return (
    <div>
      <ListTable titles={["Name", "Email", "Category"]} data={users} onDelete={onDelete} onEdit={onEdit} />
      <div>
        <div id="crud-modal" tabIndex="-1" aria-hidden="true" className={showPopup ? "fixed inset-0 flex items-center justify-center z-50 overflow-y-auto bg-gray-800 bg-opacity-75" : "hidden"}>
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Employee Details
                </h3>
                <button type="button" onClick={() => setshowPopup(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <form className="p-4 md:p-5" onSubmit={onUpdate}>
                <div className="grid gap-4 mb-4 grid-cols-2">
                  <div className="col-span-2">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                    <input type="text" name="name" value={name} onChange={(e) => setname(e.target.value)} id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required />
                  </div>
                 
                  <div className="col-span-2">
                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                    <CustomSelectBox category={category} setcategory={setcategory} options={categories} />
                  </div>
                </div>
                <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                  <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
