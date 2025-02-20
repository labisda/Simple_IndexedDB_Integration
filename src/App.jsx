import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { indexedDbService } from "./services/indexedDb.service";

function App() {

    useEffect(() => {
        fetchEmployeeList();
    }, []);

    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [team, setTeam] = useState('');

    const [employeeList, setEmployeeList] = useState([]);
    const [isEditing, setIsEditing] = useState(false);



    // Call indexedDbService.submitData() to handle the form submission
    const handleSubmit = () => {

        // Validate the form fields
        if (employeeName === '' || team === '') {
            alert('Please fill all the fields');
            return;
        }

        // Get the form data
        const payload = {
            employeeId: uuidv4(), // generate unique id
            employeeName: employeeName,
            employeeTeam: team
        }

        console.log(payload)

        indexedDbService.submitData(payload)
            .then(async () => {

                await fetchEmployeeList();
                formReset();
            });
    }


    // Call indexedDbService.updateData() to update the data in Indexed DB
    const handleUpdate = () => {

        // Validate the form fields
        if (employeeId === '' || employeeName === '' || team === '') {
            alert('Please fill all the fields');
            return;
        }

        // Get the form data
        const payload = {
            employeeId: employeeId,
            employeeName: employeeName,
            employeeTeam: team
        }

        indexedDbService.updateData(employeeId, payload)
            .then(async () => {
                await fetchEmployeeList();
                formReset();
            });
    }

    const formReset = () => {
        // Reset values of employeeId, employeeName and team
        setEmployeeId('');
        setEmployeeName('');
        setTeam('');
        setIsEditing(false);
    }


    // Call indexedDbService.deleteData() to delete the data from Indexed DB
    const deleteEmployee = async (employeeId) => {

        const confirmation = confirm('Are you sure you want to delete this employee?');
        if (confirmation) {
            await indexedDbService.deleteData(employeeId);
            await fetchEmployeeList();
        }
    }

    const deleteAllEmployees = async () => {
        const confirmation = confirm('Are you sure you want to delete all employees?');
        if (confirmation) {
            await indexedDbService.deleteAllData();
            await fetchEmployeeList();
        }
    }

    // Call indexedDbService.getAllData() to fetch the data from Indexed DB
    const fetchEmployeeList = async () => {
        const data = await indexedDbService.getAllData();

        // Update the state with the fetched data
        setEmployeeList(data);
    }

    return (

        <div className="flex flex-row items-start justify-center gap-10 mt-20">
            {/* Simple Forms */}
            <div className="border-2 border-gray-300 rounder-sm shadow-sm w-full max-w-[550px] p-5">
                <h2 className="font-bold text-xl">Simple Form</h2>

                <form className="flex flex-col gap-5 mt-5">
                    <div hidden={!isEditing}>
                        <label htmlFor="employeeId" className="block mb-2 text-sm font-medium text-gray-900">Employee ID</label>
                        <input type="text" id="employeeId"
                            className="block bg-gray-50 outline-gray-400 border-2 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 focus:outline-blue-500 focus:outline-2 focus:border-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                            value={employeeId}
                            onChange={(event) => { setEmployeeId(event.target.value) }}
                            readOnly
                            disabled
                        />
                    </div>

                    <div>
                        <label htmlFor="employeeName" className="block mb-2 text-sm font-medium text-gray-900">Employee Name</label>
                        <input type="text" id="employeeName"
                            className="block bg-gray-50 outline-gray-400 border-2 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 focus:outline-blue-500 focus:outline-2 focus:border-blue-500"
                            value={employeeName}
                            onChange={(event) => { setEmployeeName(event.target.value) }}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="team" className="block mb-2 text-sm font-medium text-gray-900">Team</label>

                        <input type="text" id="team"
                            className="block bg-gray-50 outline-gray-400 border-2 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 focus:outline-blue-500 focus:outline-2 focus:border-blue-500"
                            value={team}
                            onChange={(event) => { setTeam(event.target.value) }}
                            required
                        />
                    </div>

                    {
                        isEditing ?
                            (
                                <>
                                    <button type='button'
                                        onClick={() => { handleUpdate() }}
                                        className='text-white py-3 rounded bg-blue-600 hover:bg-blue-700 cursor-pointer'>
                                        Update Details
                                    </button>
                                    <button type='button'
                                        onClick={formReset}
                                        className='text-black py-3 rounded bg-gray-300 hover:bg-gray-400 hover:text-white cursor-pointer'>
                                        Cancel
                                    </button>
                                </>
                            )
                            :
                            (
                                <button
                                    type='button'
                                    onClick={() => { handleSubmit() }}
                                    className='text-white py-3 rounded bg-blue-600 hover:bg-blue-700 cursor-pointer'>
                                    Submit
                                </button>
                            )
                    }


                </form>
            </div>



            {/* View Table */}
            <div className="relative overflow-x-auto w-full max-w-[1000px]">
                <div className="text-right">
                    <button className='px-10 py-4 bg-red-600 rounded-lg mb-5 text-left text-white hover:bg-red-700 cursor-pointer'
                        onClick={() => { deleteAllEmployees() }}
                    >
                        Delete All Data
                    </button>
                </div>
                <table className="w-full text-base text-left rtl:text-right text-gray-500">
                    <thead className=" text-base text-gray-700 uppercase bg-blue-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                #
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Employee ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Employee Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Team
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>

                        {/* Loop the data from employeeList */}
                        {
                            employeeList.map((employee, index) => {


                                return (
                                    <tr key={index} className="bg-white border-b border-blue-200">
                                        <td className="px-6 py-4">
                                            {index + 1}
                                        </td>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {employee.employeeId}
                                        </th>
                                        <td className="px-6 py-4">
                                            {employee.employeeName}
                                        </td>
                                        <td className="px-6 py-4">
                                            {employee.employeeTeam}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                className='border-2 bg-green-600 hover:bg-green-700 transition-all cursor-pointer broder-gray-200 px-5 py-1 mr-0.5 rounded-sm text-white'
                                                onClick={() => { setEmployeeId(employee.employeeId); setEmployeeName(employee.employeeName); setTeam(employee.employeeTeam); setIsEditing(true) }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className='border-2 bg-red-600 hover:bg-red-700 transition-all cursor-pointer broder-gray-200 px-5 py-1 rounded-sm text-white'
                                                onClick={() => { deleteEmployee(employee.employeeId) }}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        }

                    </tbody>
                </table>
            </div>


        </div>

    );
}

export default App;