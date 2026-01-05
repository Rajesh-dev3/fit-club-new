import React from 'react';
import generalStaffIdColumns from "./columns";
import { Image } from 'antd';
import { useOutletContext } from 'react-router-dom';
import './styles.scss';

const GeneralStaffIdSection = () => {
  const { staff } = useOutletContext();
  const idFrontImage = staff?.idFront || 'https://via.placeholder.com/400x250?text=ID+Front';
  const idBackImage = staff?.idBack || 'https://via.placeholder.com/400x250?text=ID+Back';

  return (
    <div className="employee-id-section">
      <div className="id-images-section">
        <h3>ID Images</h3>
        <Image.PreviewGroup>
          <div className="id-images">
            <div className="image-column">
              <h4>Front Side</h4>
              <div className="image-container">
                <Image
                  src={idFrontImage}
                  alt="ID Front"
                  style={{
                    width: '100%',
                    height: '263px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                  preview={{ mask: <span style={{fontWeight:600, fontSize:16}}>Preview</span> }}
                />
              </div>
            </div>
            <div className="image-column">
              <h4>Back Side</h4>
              <div className="image-container">
                <Image
                  src={idBackImage}
                  alt="ID Back"
                  style={{
                    width: '100%',
                     height: '263px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                  preview={{ mask: <span style={{fontWeight:600, fontSize:16}}>Preview</span> }}
                />
              </div>
            </div>
          </div>
        </Image.PreviewGroup>
      </div>
    </div>
  );
};

export default GeneralStaffIdSection;
