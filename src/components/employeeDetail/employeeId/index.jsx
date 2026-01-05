
import React from 'react';
import { Image } from 'antd';
import { useOutletContext } from 'react-router-dom';
import './styles.scss';

const EmployeeIdSection = () => {
  const { employee } = useOutletContext();
  const idFrontImage = employee?.idFront || 'https://via.placeholder.com/400x250?text=ID+Front';
  const idBackImage = employee?.idBack || 'https://via.placeholder.com/400x250?text=ID+Back';

  return (
    <div className="employee-id-section">
      {/* ID Images - Front and Back */}
      <div className="id-images-section">
        <h3>ID Images</h3>
        <Image.PreviewGroup>
          <div className="id-images">
            {/* Front Image */}
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

            {/* Back Image */}
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

export default EmployeeIdSection;
