import { useQuery } from 'react-query'
import { companyAPI } from '../services/api'
import { Building2 } from 'lucide-react'
import Spinner from '../components/Spinner'

const Companies = () => {
  const { data, isLoading } = useQuery('companies', () => companyAPI.getCompanies())

  const companies = data?.data?.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <p className="text-gray-600 mt-1">Manage companies in the system</p>
      </div>

      <div className="card">
        {isLoading ? (
          <Spinner />
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">No companies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Admin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{company.country}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {company.currency?.code} ({company.currency?.symbol})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {company.adminUser?.name || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Companies
