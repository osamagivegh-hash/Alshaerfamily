import React, { useState, useEffect } from 'react'
import { adminContacts } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'

const AdminContacts = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const data = await adminContacts.getAll()
      setContacts(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await adminContacts.updateStatus(contactId, newStatus)
      toast.success('تم تحديث حالة الرسالة بنجاح')
      fetchContacts()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (contactId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return

    try {
      await adminContacts.delete(contactId)
      toast.success('تم حذف الرسالة بنجاح')
      setSelectedContact(null)
      fetchContacts()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800'
      case 'read': return 'bg-blue-100 text-blue-800'
      case 'replied': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'جديدة'
      case 'read': return 'مقروءة'
      case 'replied': return 'تم الرد'
      case 'archived': return 'مؤرشفة'
      default: return 'غير محدد'
    }
  }

  const filteredContacts = contacts.filter(contact => {
    if (filterStatus === 'all') return true
    return contact.status === filterStatus
  })

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    read: contacts.filter(c => c.status === 'read').length,
    replied: contacts.filter(c => c.status === 'replied').length,
    archived: contacts.filter(c => c.status === 'archived').length
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-palestine-black">إدارة الرسائل</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة رسائل التواصل من الزوار</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-palestine-black">{stats.total}</div>
          <div className="text-sm text-gray-600">إجمالي الرسائل</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.new}</div>
          <div className="text-sm text-red-700">جديدة</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.read}</div>
          <div className="text-sm text-blue-700">مقروءة</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
          <div className="text-sm text-green-700">تم الرد</div>
        </div>
        <div className="bg-gray-50 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
          <div className="text-sm text-gray-700">مؤرشفة</div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filterStatus === 'all'
                ? 'bg-palestine-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            الكل ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('new')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filterStatus === 'new'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            جديدة ({stats.new})
          </button>
          <button
            onClick={() => setFilterStatus('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filterStatus === 'read'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            مقروءة ({stats.read})
          </button>
          <button
            onClick={() => setFilterStatus('replied')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filterStatus === 'replied'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            تم الرد ({stats.replied})
          </button>
          <button
            onClick={() => setFilterStatus('archived')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filterStatus === 'archived'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            مؤرشفة ({stats.archived})
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow-md">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">📧</div>
            <p>
              {filterStatus === 'all' 
                ? 'لا توجد رسائل متاحة' 
                : `لا توجد رسائل ${getStatusLabel(filterStatus)}`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  contact.status === 'new' ? 'bg-red-50' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-palestine-black">
                        {contact.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {getStatusLabel(contact.status)}
                      </span>
                      {contact.status === 'new' && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{contact.email}</p>
                    <p className="text-gray-700 line-clamp-2">
                      {contact.message.substring(0, 100)}...
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{new Date(contact.date).toLocaleString('ar-SA')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mr-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedContact(contact)
                      }}
                      className="text-palestine-green hover:bg-palestine-green hover:text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      عرض
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-palestine-black mb-2">
                    تفاصيل الرسالة
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedContact.status)}`}>
                      {getStatusLabel(selectedContact.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                  <p className="text-palestine-black font-semibold">{selectedContact.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <p className="text-palestine-black">{selectedContact.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                  <p className="text-gray-600">{new Date(selectedContact.date).toLocaleString('ar-SA')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حالة الرسالة</label>
                  <div className="flex gap-2">
                    {['new', 'read', 'replied', 'archived'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedContact.id, status)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                          selectedContact.status === status
                            ? getStatusColor(status)
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  className="bg-palestine-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  حذف الرسالة
                </button>
                
                <div className="flex gap-3">
                  <a
                    href={`mailto:${selectedContact.email}?subject=رد على رسالتك - عائلة الشاعر&body=مرحباً ${selectedContact.name}،%0A%0Aشكراً لك على تواصلك معنا...`}
                    className="bg-palestine-green text-white px-4 py-2 rounded-lg hover:bg-olive-700 transition-colors duration-200"
                  >
                    الرد عبر البريد
                  </a>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminContacts
