import React, { useState } from 'react'


import './appointment.css'

export default function Appointment() {
    const [inputType, setInputType] = useState('text');
    const [showDropDown, setShowDropDown] = useState(false);
    const [provider, setProvider] = useState("Health Care Providers")

    const handleFocus = () => {
        setInputType('date');
    };

    const handleBlur = () => {
        setInputType('text');
    };

    const providers = ['Regis HealthCare', 'Atility Aged Care', 'Arcare Aged Care', 'Bluecross', 'McKenzine Group']

    return (
        <>
            <div className="userProfile-container">
                <div className="userProfile-section">
                   

                    <center>
                    <header>
                        <h1>APPOINTMENT MANAGEMENT</h1>
                    </header>
                    <br>
                    
                    </br>
                        {/* <h2 className='py-5'>Appointment Management</h2> */}
                    </center>
                    <div className='row mb-3 px-5'>
                        <div className='col-md-5 mr-0'>
                            <div className="user-date-input-container w-100">
                                <input
                                    placeholder="Check Availability"
                                    className="user-textbox-n form-control br-none"
                                    type={inputType}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    id="date"
                                />
                            </div>
                        </div>
                        <div className='col-md-5 ml-0 mr-0'>
                            <div className="d-flex justify-content-between pt-3 health-conatiner br-none pointer"
                                onClick={() => setShowDropDown(!showDropDown)}
                            >
                                <div><p className='h-provider'>{provider}</p></div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                            {
                                showDropDown ?
                                    <div className="providers">

                                        {
                                            providers.map((pro, key) => (
                                                <div className="d-flex justify-content-between w-100 py-3 border-bottom border-dark px-3 pointer" onClick={() => { setProvider(pro); setShowDropDown(false) }} key={key}>
                                                    <div>
                                                        <p className='healthcare-title pt-1'>{pro}</p>
                                                    </div>
                                                    <div>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="health-icon">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))
                                        }


                                    </div>

                                    : ''
                            }

                        </div>
                        <div className='col-md-2 ml-0'>
                            <button className='btn btn-success btn-search w-100'>Search &nbsp;
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className='my-5 px-5'>
                        <button className='btn btn-danger btn-reminder'> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="alert-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
                        </svg> &nbsp; Reminders
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
