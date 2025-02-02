import React, { useState } from 'react'
import ShopkeeperHeader from '../Components/ShopkeeperHeader'
import AddExcelData from '../Components/AddExcelData'
import ReviewExcelData from '../Components/ReviewExcelData'

const UploadExcel = () => {
const [data,setdata]=useState([])
  return (
    <div>
      <ShopkeeperHeader/>
      {
        data && data.length!==0 ? <ReviewExcelData data={data} setdata={setdata}/> :<AddExcelData fun={setdata}/>         //data hua to review nhi to add excel data
      }
     </div>
  )
}

export default UploadExcel