<template>
    <div>

        <div class="modal fade" id="dikamodal" style="display: none;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 class="modal-title">transaction ID</h4>
                    </div>
                    <div class="modal-body">
                        Transaction details
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default pull-left" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="box">
            <div class="box-header">
                <!-- <h3 class="box-title"></h3> -->
                <select class="form-control box-title" style="width: 30%">
                    <option>All transactions</option>
                    <option>Initialized</option>
                    <option>Payment received</option>
                    <option>Completed</option>
                </select>
            </div>
            <!-- /.box-header -->
            <div class="box-body no-padding">
                <table class="table table-striped">
                    <tbody>
                        <tr>
                            <th style="width: 10px">#</th>
                            <th>User</th>
                            <th>deposit Asset</th>
                            <th>Receipt Asset</th>
                            <th>depositAmount</th>
                            <th>Created At</th>
                            <th>Last Updated</th>
                            <th style="width:15%;">status</th>
                            <th>action</th>
                        </tr>
                        <tr>
                            <td>1.</td>
                            <td>Dika Igili</td>
                            <td>bitcoin</td>
                            <td>ethereum</td>
                            <td>0.532</td>
                            <td>30/05/2018 09:15:59</td>
                            <td>03/12/2019 42:15:30</td>
                            <td>
                                <select class="form-control box-title">
                                    <option>Initialized</option>
                                    <option>Payment received</option>
                                    <option>Completed</option>
                                </select>
                            </td>

                            <td>
                                <button type="button" data-toggle="#dikamodal" data-target="" class="btn btn-block btn-primary">
                                    View
                                </button>
                            </td>
                        </tr>

                        <tr>
                            <td>1.</td>
                            <td>Dika Igili</td>
                            <td>bitcoin</td>
                            <td>ethereum</td>
                            <td>0.532</td>
                            <td>30/05/2018 09:15:59</td>
                            <td>03/12/2019 42:15:30</td>
                            <td>
                                <select class="form-control box-title">
                                    <option>Initialized</option>
                                    <option>Payment received</option>
                                    <option>Completed</option>
                                </select>
                            </td>

                            <td>
                                <button type="button" data-toggle="#dikamodal" data-target="" class="btn btn-block btn-primary">
                                    View
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>1.</td>
                            <td>Dika Igili</td>
                            <td>bitcoin</td>
                            <td>ethereum</td>
                            <td>0.532</td>
                            <td>30/05/2018 09:15:59</td>
                            <td>03/12/2019 42:15:30</td>
                            <td>
                                <select class="form-control box-title">
                                    <option>Initialized</option>
                                    <option>Payment received</option>
                                    <option>Completed</option>
                                </select>
                            </td>

                            <td>
                                <button type="button" data-toggle="#dikamodal" data-target="" class="btn btn-block btn-primary">
                                    View
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- /.box-body -->
        </div>

    </div>
</template>
