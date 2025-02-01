import React from 'react'
import Footer from '../../CommonComponents/Footer'
import Title from '../../CommonComponents/Title'

const ReviewExcelData = ({data}) => {
    const Submit=()=>{

    }
    const discard=()=>{

    }
  return (
    <div className="main-content">
        <div className="page-content">
            <div className="container-fluid">
                <Title Name={" Excel Product List"} />
                <div className="row pb-4 gy-3">
                    <div className='col-sm-4'>
                    <a href="#" onClick={Submit} className="btn btn-primary addtax-modal">Submit</a>
                    <a href="#" onClick={discard} className="ms-1 btn btn-danger addtax-modal">Discard</a>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="table-responsive table-card">
                                    <table className="table table-nowrap align-middle mb-0">
                                        <thead>
                                            <tr className="text-muted text-uppercase">
                                                <th style={{ width: 50 }}>
                                                    <div className="form-check">
                                                        #
                                                    </div>
                                                </th>
                                                <th scope="col" style={{ width: "13%" }}>Product Name </th>
                                                <th scope="col" style={{ width: "9%" }}>Model </th>
                                                <th scope="col" style={{ width: "26%" }}>Description</th>
                                                <th scope="col">Company</th>
                                                <th scope="col">In Stock</th>
                                                <th scope="col">Rate(₹)</th>
                                                <th scope="col" style={{ width: '8%' }}>Price(₹)</th>
                                                <th scope="col" style={{ width: '6%' }}>Dis.(%)</th>
                                                <th scope="col" style={{ width: '6%' }}>Tax(₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                data?.map((obj,index)=>{
                                                    return(<tr key={index}>
                                                        <td><div className='form-check'>{index+1}</div></td>
                                                        {/* <td>
                                                            <div className='d-flex align-items-center'>
                                                                <div className='flex-grow-1'>
                                                                  <h6 className='fs-16 mb-1'>{obj?.name}</h6>
                                                                </div>
                                                            </div>
                                                        </td> */}
                                                        <td>{obj?.name}</td>
                                                        <td>{obj?.model}</td>
                                                        <td>{obj?.description}</td>
                                                        <td>{obj?.company}</td>
                                                        <td>{obj?.stock}</td>
                                                        <td>{"₹"+obj?.rate}/-</td>
                                                        <td>{"₹"+obj?.price}/-</td>
                                                        <td>{obj?.discount+"%"}</td>
                                                        <td>{obj?.tax+"%"}</td>
                                                    </tr>)
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
  )
}

export default ReviewExcelData
